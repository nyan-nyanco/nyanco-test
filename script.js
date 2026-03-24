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

    alert("Install Phantom Wallet or open this site in phantom");
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

/*
async function connectWallet() {
  const provider = window.solana;

  // 1. Phantomがインストールされているか、またはモバイルブラウザ内かチェック
  if (!provider?.isPhantom) {
    // モバイル端末（iOS/Android）か判定
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Phantomのアプリ内ブラウザで開かせるためのディープリンク
      // あなたのサイトのURL（例: https://example.com）をエンコードして指定
      const appUrl = window.location.href.split('#')[0];
      const encodedUrl = encodeURIComponent(appUrl);
      const phantomLink = `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`;
      
      window.open(phantomLink, "_blank");
      return;
    } else {
      alert("Install Phantom Wallet");
      window.open("https://phantom.app/", "_blank");
      return;
    }
  }

  try {
    // すでにアプリ内ブラウザにいる場合は、通常のconnectが動作します
    const response = await provider.connect();
    const wallet = response.publicKey.toString();

    console.log("Connected:", wallet);

    if (connectBtn) {
      connectBtn.innerText = wallet.slice(0, 4) + "..." + wallet.slice(-4);
    }
    if (form) form.style.display = "flex";

  } catch (err) {
    console.warn("Connection rejected", err);
  }
}
*/


