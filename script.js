  const link = document.querySelector(".chat-help-link");
  const modal = document.querySelector(".chat-modal");
  const close = document.querySelector(".chat-modal-close");
  const form = document.querySelector(".chat-form");

  // 初期値は非表示
  modal.style.display = "none";
 

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
    if(e.target === modal) modal.style.display = "none"; form.style.display = "none";
  });






  //connect Phantom
  async function connectWallet() {

  if (window.solana && window.solana.isPhantom) {
    try {

      const response = await window.solana.connect();
      const wallet = response.publicKey.toString();

      console.log("Connected:", wallet);

      document.getElementById("connect-wallet").innerText =
        wallet.slice(0,4) + "..." + wallet.slice(-4);
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

