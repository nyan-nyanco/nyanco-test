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
  const amount = Number(amountStr);

  // 1. 数値チェック
  if (Number.isNaN(amount) || amount <= 0) {
    alert("Please enter a valid NYANCO amount.");
    return;
  }

  // 2. 金額に応じた文字数制限の計算 (例: 100 NYANCO = 10文字, 1000 NYANCO = 100文字)
  // ここでは「金額の10%」を最大文字数とする例にしています
  const maxChars = Math.floor(amount * 0.1); 
  const currentLength = message.length;

  if (amount < 100) {
    alert("Minimum NYANCO amount is 100.");
    return;
  }
  
  if (name.length > 20) {
    alert("Name is too long! (Max 20 chars)");
    return;
  }

  // 3. 文字数オーバーのチェック
  if (currentLength > maxChars) {
    alert(`Too long! For ${amount} NYANCO, the limit is ${maxChars} characters. (Current: ${currentLength})`);
    return;
  }

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
