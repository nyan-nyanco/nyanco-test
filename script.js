const link = document.querySelector(".chat-help-link");
const modal = document.querySelector(".chat-modal");
const close = document.querySelector(".chat-modal-close");
const form = document.querySelector("#chat-form");

// 初期値は非表示
modal.style.display = "none";
form.style.display = "none";

// クリックで開く
link.addEventListener("click", () => {
  modal.style.display = "flex";
});

// ×ボタンで閉じる
close.addEventListener("click", () => {
  modal.style.display = "none";
  form.style.display = "none";
});

// 背景クリックで閉じる
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    form.style.display = "none";
  }
});

// Connect Phantom
async function connectWallet() {
  if (window.solana && window.solana.isPhantom) {
    try {
      const response = await window.solana.connect();
      const wallet = response.publicKey.toString();

      console.log("Connected:", wallet);

      document.getElementById("connect-wallet").innerText =
        wallet.slice(0, 4) + "..." + wallet.slice(-4);
      form.style.display = "flex";

    } catch (err) {
      console.log("User rejected connection");
    }

  } else {
    alert("Phantom wallet not found. Please install Phantom.");
  }
}
document
  .getElementById("connect-wallet")
  .addEventListener("click", connectWallet);

// Send NYANCO
const webhookURL = "https://discord.com/api/webhooks/1481916009500770397/cRpvDH6O9Qbpx-RjswuqCr2HuPj6rGabCL25xNW93ls9sRtI783yNHMd2p9mQuJUI1Ks";

document.getElementById("send-chat").addEventListener("click", async () => {

  const name = document.getElementById("chat-name").value || "Anonymous";
  const message = document.getElementById("chat-message").value.trim();
  const amountStr = document.getElementById("chat-amount").value.trim();

  // バリデーション
  if (!message) {
    alert("Please enter a message.");
    return;
  }

  if (!amountStr) {
    alert("Please enter an amount of NYANCO.");
    return;
  }

  const amount = Number(amountStr);

  if (isNaN(amount)) {
    alert("NYANCO amount must be a number.");
    return;
  }

  if (amount < 100) {
    alert("Minimum NYANCO amount is 100.");
    return;
  }
   // amountに応じて文字数上限を返す関数
function getMaxChars(amount) {
  if (amount < 1000) return 100;
  else if (amount < 5000) return 300;
  else if (amount < 10000) return 500;
  else return Infinity; // 10000以上は制限なし
}

// send-chatイベント内
const amount = Number(amountStr);
const maxChars = getMaxChars(amount);

if (message.length > maxChars) {
  alert(`Your message is too long! Maximum ${maxChars} characters for ${amount} NYANCO.`);
  return;
}

  // Discord送信用メッセージ
  const content = `
💬 NYANCO CHAT
Name: ${name}
Message: ${message}
Amount: ${amount} NYANCO
`;

  try {
    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content })
    });

    alert("Chat sent to Discord!");
    
    // 送信後フォームクリア
    document.getElementById("chat-message").value = "";
    document.getElementById("chat-amount").value = "";

  } catch (err) {
    console.error("Failed to send chat:", err);
    alert("Failed to send chat.");
  };
