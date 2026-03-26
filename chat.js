// =============================
// SETTINGS
// =============================

const NYANCO_MINT = "HXVAWuvZaqrgUjjtJuGizbBkqBPb6iv9MHT4eB5Ypump";
const TREASURY = "GJC8b7x8fCfTPMtiJRMDravSHXfjdsiwnv5c39JSM1Et";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/xxxxx"; // ←自分のに

const DECIMALS = 6;
const splToken = window.solanaSplToken;

if (!splToken) {
    alert("SPL Token library is not loaded!");
}
const connection =
  new solanaWeb3.Connection(
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
  nameInput.maxLength = 10;

  counter.innerText = `0 / ${maxChars}`;
});

messageInput.addEventListener("input", () => {
  counter.innerText =
    `${messageInput.value.length} / ${messageInput.maxLength}`;
});

// =============================
// PRICE FETCH
// =============================

async function getTokenPrice() {
  try {
    const res = await fetch(
      `https://price.jup.ag/v4/price?ids=${NYANCO_MINT}`
    );
    const data = await res.json();
    return data.data[NYANCO_MINT]?.price || 0;
  } catch {
    return 0;
  }
}

// =============================
// SEND CHAT
// =============================

sendBtn?.addEventListener("click", async () => {

  const provider = window.solana;

  if (!provider || !provider.isPhantom) {
    alert("Install Phantom");
    return;
  }

  try {

    // 接続確認
    if (!provider.publicKey) {
      await provider.connect();
    }

    const wallet = provider.publicKey;

    const mint = new solanaWeb3.PublicKey(NYANCO_MINT);
    const treasury = new solanaWeb3.PublicKey(TREASURY);

    const amount = Number(amountInput.value);
    const message = messageInput.value.trim();
    const name = nameInput.value || "Anonymous";

    if (amount < 100) throw new Error("Minimum 100 NYANCO");
    if (name.length > 20) throw new Error("Name too long");
    if (message.length > messageInput.maxLength)
      throw new Error("Message too long");

    // =============================
    // 🔥 正しいATA取得（超重要）
    // =============================

    const tokenAccounts =
      await connection.getParsedTokenAccountsByOwner(
        wallet,
        { mint }
      );

    if (tokenAccounts.value.length === 0) {
      throw new Error("No token account found");
    }

    const fromATA =
      tokenAccounts.value[0].pubkey;

    const toATA =
      await splToken.getAssociatedTokenAddress(
        mint,
        treasury
      );

    const amountRaw =
      Math.floor(amount * (10 ** DECIMALS));

    const tx = new solanaWeb3.Transaction();

    // =============================
    // 🔥 ATA作成（必要なら）
    // =============================

    const toInfo =
      await connection.getAccountInfo(toATA);

    if (!toInfo) {
      tx.add(
        splToken.createAssociatedTokenAccountInstruction(
          wallet,
          toATA,
          treasury,
          mint
        )
      );
    }

    // =============================
    // transfer
    // =============================

    tx.add(
      splToken.createTransferInstruction(
        fromATA,
        toATA,
        wallet,
        amountRaw
      )
    );

    // =============================
    // blockhash（新方式）
    // =============================

    const latestBlockhash =
      await connection.getLatestBlockhash();

    tx.recentBlockhash =
      latestBlockhash.blockhash;

    tx.feePayer = wallet;

    // =============================
    // 署名 & 送信
    // =============================

    const signed =
      await provider.signTransaction(tx);

    const signature =
      await connection.sendRawTransaction(
        signed.serialize()
      );

    // =============================
    // confirm（重要修正）
    // =============================

    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight:
        latestBlockhash.lastValidBlockHeight
    });

    console.log("TX:", signature);

    // =============================
    // DISCORD
    // =============================

    const price = await getTokenPrice();
    const value = amount * price;

    const content = `
💬 NYANCO CHAT

Name: ${name}
Message: ${message}

Amount: ${amount} NYANCO
Value: $${value.toFixed(2)}

Wallet: ${wallet}

https://solscan.io/tx/${signature}
`;

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    alert("Chat sent!");

    messageInput.value = "";
    amountInput.value = "";

  } catch (err) {

    console.error("FULL ERROR:", err);

    alert(err.message || "Transaction failed");
  }

});
