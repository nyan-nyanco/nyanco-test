alert("START");
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
  "https://mainnet.helius-rpc.com/?api-key=0f522380-8021-41c8-af33-54396cbe75ee"
);
alert("before element");
// =============================
// 基本チェック
// =============================
alert("solanaWeb3: " + typeof solanaWeb3);

// =============================
// 定数チェック
// =============================
try {
  const mint = new solanaWeb3.PublicKey("HXVAWuvZaqrgUjjtJuGizbBkqBPb6iv9MHT4eB5Ypump");
  alert("MINT OK: " + mint.toString());
} catch (e) {
  alert("MINT NG");
}

try {
  const treasury = new solanaWeb3.PublicKey("GJC8b7x8fCfTPMtiJRMDravSHXfjdsiwnv5c39JSM1Et");
  alert("TREASURY OK: " + treasury.toString());
} catch (e) {
  alert("TREASURY NG");
}

try {
  const tokenProgram = new solanaWeb3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPF7w9E1x7hZt8Z8h6f7g");
  alert("TOKEN PROGRAM OK");
} catch (e) {
  alert("TOKEN PROGRAM NG");
}

try {
  const ataProgram = new solanaWeb3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
  alert("ATA PROGRAM OK");
} catch (e) {
  alert("ATA PROGRAM NG");
}

// =============================
// DOMチェック
// =============================
const amountInput = document.getElementById("chat-amount");
const messageInput = document.getElementById("chat-message");
const nameInput = document.getElementById("chat-name");
const counter = document.getElementById("char-counter");
const sendBtn = document.getElementById("send-chat");

alert("amountInput: " + !!amountInput);
alert("messageInput: " + !!messageInput);
alert("nameInput: " + !!nameInput);
alert("counter: " + !!counter);
alert("sendBtn: " + !!sendBtn);

// =============================
// Phantomチェック
// =============================
alert("phantom: " + !!window.solana);

// =============================
// RPCチェック
// =============================
try {
  const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
  alert("RPC OK");
} catch (e) {
  alert("RPC NG");
}

alert("END");
