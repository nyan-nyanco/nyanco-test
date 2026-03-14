// =============================
// UI SCRIPT
// =============================

// 要素取得
const link = document.querySelector(".chat-help-link");
const modal = document.querySelector(".chat-modal");
const closeBtn = document.querySelector(".chat-modal-close");
const form = document.querySelector("#chat-form");
const connectBtn = document.getElementById("connect-wallet");

// 初期状態
if (modal) modal.style.display = "none";
if (form) form.style.display = "none";

// モーダルを開く
link?.addEventListener("click", (e) => {

  e.preventDefault();

  if (modal) modal.style.display = "flex";

});

// モーダル閉じる
closeBtn?.addEventListener("click", () => {

  if (modal) modal.style.display = "none";
  if (form) form.style.display = "none";

});

// 背景クリック
modal?.addEventListener("click", (e) => {

  if (e.target === modal) {

    modal.style.display = "none";
    form.style.display = "none";

  }

});

// =============================
// PHANTOM CONNECT
// =============================

async function connectWallet() {

  const provider = window.solana;

  if (!provider || !provider.isPhantom) {

    alert("Install Phantom Wallet");
    window.open("https://phantom.app/", "_blank");

    return;

  }

  try {

    const response = await provider.connect();
    const wallet = response.publicKey.toString();

    console.log("Connected:", wallet);

    if (connectBtn) {

      connectBtn.innerText =
        wallet.slice(0,4) +
        "..." +
        wallet.slice(-4);

    }

    if (form) form.style.display = "flex";

  } catch (err) {

    console.warn("Connection rejected");

  }

}

connectBtn?.addEventListener("click", connectWallet);
