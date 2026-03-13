// 要素の取得
const link = document.querySelector(".chat-help-link");
const modal = document.querySelector(".chat-modal");
const closeBtn = document.querySelector(".chat-modal-close"); // closeは予約語に近いので名称変更
const form = document.querySelector("#chat-form");
const connectBtn = document.getElementById("connect-wallet");
const sendBtn = document.getElementById("send-chat");

// 要素が存在する場合のみ初期化
if (modal && form) {
  modal.style.display = "none";
  form.style.display = "none";
}

// クリックで開く
link?.addEventListener("click", (e) => {
  e.preventDefault(); // aタグなどの場合はデフォルト動作を抑制
  if (modal) modal.style.display = "flex";
});

// ×ボタンで閉じる
closeBtn?.addEventListener("click", () => {
  if (modal) modal.style.display = "none";
  if (form) form.style.display = "none";
});

// 背景クリックで閉じる
modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    form.style.display = "none";
  }
});

// Connect Phantom
async function connectWallet() {
  const solana = window.solana;

  if (solana?.isPhantom) {
    try {
      const response = await solana.connect();
      const wallet = response.publicKey.toString();

      console.log("Connected:", wallet);

      if (connectBtn) {
        connectBtn.innerText = wallet.slice(0, 4) + "..." + wallet.slice(-4);
      }
      if (form) form.style.display = "flex";

    } catch (err) {
      console.warn("User rejected connection", err);
    }
  } else {
    alert("Phantom wallet not found. Please install Phantom.");
    window.open("https://phantom.app/", "_blank");
  }
}

connectBtn?.addEventListener("click", connectWallet);

// Send NYANCO
const webhookURL = "https://discord.com/api/webhooks/1481916009500770397/cRpvDH6O9Qbpx-RjswuqCr2HuPj6rGabCL25xNW93ls9sRtI783yNHMd2p9mQuJUI1Ks";

sendBtn?.addEventListener("click", async () => {
  const nameEl = document.getElementById("chat-name");
  const messageEl = document.getElementById("chat-message");
  const amountEl = document.getElementById("chat-amount");

  const name = nameEl?.value || "Anonymous";
  const message = messageEl?.value.trim();
  const amountStr = amountEl?.value.trim();

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

  // 数値チェック（isNaN よりも詳細にチェック）
  if (Number.isNaN(amount) || amount <= 0) {
    alert("Please enter a valid NYANCO amount.");
    return;
  }

  if (amount < 100) {
    alert("Minimum NYANCO amount is 100.");
    return;
  }

  // Discord送信用メッセージ
  const content = `💬 **NYANCO CHAT**\n**Name:** ${name}\n**Message:** ${message}\n**Amount:** ${amount} NYANCO`;

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content })
    });

    if (!response.ok) throw new Error("Webhook post failed");

    alert("Chat sent to Discord!");
    
    // 送信後フォームクリア
    if (messageEl) messageEl.value = "";
    if (amountEl) amountEl.value = "";

  } catch (err) {
    console.error("Failed to send chat:", err);
    alert("Failed to send chat.");
  }
});
