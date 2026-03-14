// =============================
// SETTINGS
// =============================

const NYANCO_MINT = "YOUR_MINT_ADDRESS";
const TREASURY = "YOUR_TREASURY_WALLET";
const DISCORD_WEBHOOK = "YOUR_WEBHOOK";

const DECIMALS = 6;

const connection =
  new solanaWeb3.Connection(
    "https://api.mainnet-beta.solana.com"
  );

// =============================
// ELEMENTS
// =============================

const amountInput =
  document.getElementById("chat-amount");

const messageInput =
  document.getElementById("chat-message");

const nameInput =
  document.getElementById("chat-name");

const counter =
  document.getElementById("char-counter");

const sendBtn =
  document.getElementById("send-chat");

messageInput.disabled = true;
messageInput.maxLength = 0;
counter.innerText = "Enter NYANCO amount first";


// =============================
// REALTIME CHAR LIMIT
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

  const maxChars = Math.floor(amount);

  messageInput.disabled = false;
  messageInput.maxLength = maxChars;

  counter.innerText = `0 / ${maxChars}`;

});

messageInput.addEventListener("input", () => {

  const max = messageInput.maxLength;
  const len = messageInput.value.length;

  counter.innerText = `${len} / ${max}`;

  });

// =============================
// PRICE FETCH
// =============================

async function getTokenPrice() {

  try {

    const res =
      await fetch(
        `https://price.jup.ag/v4/price?ids=${NYANCO_MINT}`
      );

    const data = await res.json();

    return data.data[NYANCO_MINT].price;

  } catch {

    return 0;

  }

}

// =============================
// SEND CHAT
// =============================


sendBtn?.addEventListener(
  "click",
  async () => {
　　　
  const provider = window.solana;

  if (!provider || !provider.isPhantom) {

    alert("Install Phantom");

    return;

  }

  const amount =
    Number(amountInput.value);

  const message =
    messageInput.value.trim();

  const name =
    nameInput.value || "Anonymous";

  if (name.length > 20) {

 　 alert("Name must be 20 characters or less.");
 　 return;

　}

  if (amount < 100) {

    alert("Minimum 100 NYANCO");
    return;

  }

  if (
    message.length >
    messageInput.maxLength
  ) {

    alert("Message too long");
    return;

  }

  try {

    await provider.connect();

    const wallet =
      provider.publicKey;

    const mint =
      new solanaWeb3.PublicKey(
        NYANCO_MINT
      );

    const treasury =
      new solanaWeb3.PublicKey(
        TREASURY
      );

    const fromATA =
      await splToken.getAssociatedTokenAddress(
        mint,
        wallet
      );

    const toATA =
      await splToken.getAssociatedTokenAddress(
        mint,
        treasury
      );

    const amountRaw =
        Math.floor(amount * (10 ** DECIMALS));

    const tx =
      new solanaWeb3.Transaction();

    tx.add(

      splToken.createTransferInstruction(

        fromATA,
        toATA,
        wallet,
        amountRaw

      )

    );

    tx.feePayer = wallet;

    tx.recentBlockhash =
      (
        await connection.getLatestBlockhash()
      ).blockhash;

    const signed =
      await provider.signTransaction(tx);

    const signature =
      await connection.sendRawTransaction(
        signed.serialize()
      );

    await connection.confirmTransaction(
      signature
    );

    console.log("TX:", signature);

    // =============================
    // PRICE
    // =============================

    const price =
      await getTokenPrice();

    const value =
      amount * price;

    // =============================
    // DISCORD MESSAGE
    // =============================

    const content = `

💬 NYANCO CHAT

Name:
${name}

Message:
${message}

Amount:
${amount} NYANCO

Price:
$${price}

Value:
$${value.toFixed(2)}

Wallet:
${wallet}

TX:
https://solscan.io/tx/${signature}

`;

    await fetch(
      DISCORD_WEBHOOK,
      {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        content:content
      })

    });

    alert("Chat sent!");

    messageInput.value = "";
    amountInput.value = "";

  }

  catch(err){

    console.error(err);

    alert("Transaction failed");

  }

});
