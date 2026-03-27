
// =============================
// SETTINGS
// =============================
const NYANCO_MINT = "HXVAWuvZaqrgUjjtJuGizbBkqBPb6iv9MHT4eB5Ypump";
const TREASURY = "GJC8b7x8fCfTPMtiJRMDravSHXfjdsiwnv5c39JSM1Et";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/xxxxx";

const DECIMALS = 6;

const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

const ASSOCIATED_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const connection = new solanaWeb3.Connection(
  "https://api.mainnet-beta.solana.com"
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
  nameInput.maxLength = 20;

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
  } catch {
    return 0;
  }
}

// =============================
// ATA取得
// =============================
async function findATA(wallet, mint) {
  const [address] = await solanaWeb3.PublicKey.findProgramAddress(
    [
      wallet.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer()
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

// =============================
// SEND CHAT
// =============================
sendBtn?.addEventListener("click", async () => {
  const provider = window.solana;

  if (!provider) {
    alert("Phantomをインストールしてください");
    return;
  }

  try {
    if (!provider.publicKey) {
      await provider.connect();
    }

    const wallet = provider.publicKey;
    const mint = new solanaWeb3.PublicKey(NYANCO_MINT);
    const treasury = new solanaWeb3.PublicKey(TREASURY);

    const amount = Number(amountInput.value);
    const message = messageInput.value.trim();
    const name = nameInput.value || "Anonymous";

    // =============================
    // VALIDATION
    // =============================
    if (amount < 100) throw new Error("Minimum 100 NYANCO");
    if (name.length > 20) throw new Error("Name too long");
    if (message.length > messageInput.maxLength) throw new Error("Message too long");

    // =============================
    // ATA
    // =============================
    const fromATA = await findATA(wallet, mint);
    const toATA = await findATA(treasury, mint);

    // 🔥 重要：存在チェックだけ
    const toInfo = await connection.getAccountInfo(toATA);
    if (!toInfo) {
      throw new Error("Treasury ATA not initialized");
    }

    // =============================
    // TRANSACTION
    // =============================
    const tx = new solanaWeb3.Transaction();

    const amountRaw = BigInt(Math.round(amount * Math.pow(10, DECIMALS)));

    const data = new Uint8Array(10);
    data[0] = 12; // TransferChecked
    const view = new DataView(data.buffer);
    view.setBigUint64(1, amountRaw, true);
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

    const latest = await connection.getLatestBlockhash();

    tx.recentBlockhash = latest.blockhash;
    tx.feePayer = wallet;

    const signed = await provider.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction({
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight
    }, "confirmed");

    // =============================
    // DISCORD
    // =============================
    const price = await getTokenPrice();
    const value = amount * price;

    const content = `💬 NYANCO CHAT

Name: ${name}
Message: ${message}

Amount: ${amount} NYANCO
Value: $${value.toFixed(2)}

Wallet: ${wallet.toString()}
https://solscan.io/tx/${signature}`;

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
