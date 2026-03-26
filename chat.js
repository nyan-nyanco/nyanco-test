// =============================
// SETTINGS
// =============================
const NYANCO_MINT = "HXVAWuvZaqrgUjjtJuGizbBkqBPb6iv9MHT4eB5Ypump";
const TREASURY = "GJC8b7x8fCfTPMtiJRMDravSHXfjdsiwnv5c39JSM1Et";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/xxxxx"; // ←自分のに

const DECIMALS = 6;

// 固定プログラムID
const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey("ATokenGPvbdPwn17By4jvWruA3tgKp7L678dXnks9qf");

const connection = new solanaWeb3.Connection(
  "https://mainnet.helius-rpc.com/?api-key=0f522380-8021-41c8-af33-54396cbe75ee"
);

// =============================
// ELEMENTS
// =============================
const amountInput = document.getElementById("chat-amount");
const messageInput = document.getElementById("chat-message");
const nameInput = document.getElementById("chat-name");
const counter = document.getElementById("char-counter");
const sendBtn = document.getElementById("send-chat");

// 初期状態
messageInput.disabled = true;
messageInput.maxLength = 0;
counter.innerText = "Enter NYANCO amount first";
nameInput.disabled = true;

// =============================
// INPUT CONTROL
// =============================
amountInput.addEventListener("input", () => {
  const amount = Number(amountInput.value);
  if (Number.isNaN(amount) || amount < 100) {
    messageInput.disabled = true;
    messageInput.value = "";
    messageInput.maxLength = 0;
    nameInput.disabled = true;
    counter.innerText = "Minimum 100 NYANCO";
    return;
  }
  const maxChars = Math.floor(amount * 0.2);
  messageInput.disabled = false;
  nameInput.disabled = false;
  messageInput.maxLength = maxChars;
  nameInput.maxLength = 20; // 元のチェックに合わせて20に設定
  counter.innerText = `${messageInput.value.length} / ${maxChars}`;
});

messageInput.addEventListener("input", () => {
  counter.innerText = `${messageInput.value.length} / ${messageInput.maxLength}`;
});

// =============================
// PRICE FETCH
// =============================
async function getTokenPrice() {
  try {
    const res = await fetch(`https://price.jup.ag/v4/price?ids=${NYANCO_MINT}`);
    const data = await res.json();
    return data.data[NYANCO_MINT]?.price || 0;
  } catch { return 0; }
}

// =============================
// ATA UTILS (ライブラリを使わずに計算)
// =============================
async function findATA(wallet, mint) {
  const [address] = await solanaWeb3.PublicKey.findProgramAddress(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

// =============================
// SEND CHAT
// =============================
sendBtn?.addEventListener("click", async () => {
  const provider = window.solana;
  if (!provider) return alert("Phantomをインストールしてください");

  try {
    if (!provider.publicKey) await provider.connect();
    const wallet = provider.publicKey;
    const mint = new solanaWeb3.PublicKey(NYANCO_MINT);
    const treasury = new solanaWeb3.PublicKey(TREASURY);

    const amount = Number(amountInput.value);
    const message = messageInput.value.trim();
    const name = nameInput.value || "Anonymous";

    // バリデーション
    if (amount < 100) throw new Error("Minimum 100 NYANCO");
    if (name.length > 20) throw new Error("Name too long");
    if (message.length > messageInput.maxLength) throw new Error("Message too long");

    // ATAの特定
    const fromATA = await findATA(wallet, mint);
    const toATA = await findATA(treasury, mint);

    const tx = new solanaWeb3.Transaction();

    // 宛先ATA作成命令 (もし存在しなければ)
    const toInfo = await connection.getAccountInfo(toATA);
    if (!toInfo) {
      tx.add(new solanaWeb3.TransactionInstruction({
        keys: [
          { pubkey: wallet, isSigner: true, isWritable: true },
          { pubkey: toATA, isSigner: false, isWritable: true },
          { pubkey: treasury, isSigner: false, isWritable: false },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: new Uint8Array(0),
      }));
    }

    // 送金命令 (TransferCheckedデータ構造を手動作成)
    const amountRaw = BigInt(Math.round(amount * Math.pow(10, DECIMALS)));
    const data = new Uint8Array(10);
    data[0] = 12; // TransferChecked identifier
    const view = new DataView(data.buffer);
    view.setBigUint64(1, amountRaw, true); // Amount (8 bytes, Little Endian)
    data[9] = DECIMALS;

    tx.add(new solanaWeb3.TransactionInstruction({
      keys: [
        { pubkey: fromATA, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: toATA, isSigner: false, isWritable: true },
        { pubkey: wallet, isSigner: true, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: data,
    }));

    // 送信
    const latest = await connection.getLatestBlockhash();
    tx.recentBlockhash = latest.blockhash;
    tx.feePayer = wallet;

    const signed = await provider.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());

    // 完了待ち
    await connection.confirmTransaction({
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight
    }, 'confirmed');

    // DISCORD 送信
    const price = await getTokenPrice();
    const value = amount * price;
    const content = `💬 NYANCO CHAT\n\nName: ${name}\nMessage: ${message}\n\nAmount: ${amount} NYANCO\nValue: $${value.toFixed(2)}\n\nWallet: ${wallet.toString()}\nhttps://solscan.io/tx/${signature}`;

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    alert("Chat sent!");
    messageInput.value = "";
    amountInput.value = "";
    nameInput.value = "";

  } catch (err) {
    console.error("FULL ERROR:", err);
    alert(err.message || "Transaction failed");
  }
});
