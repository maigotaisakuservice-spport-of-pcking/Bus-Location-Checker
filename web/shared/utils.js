// Firebase Configuration provided by user
window.firebaseConfig = {
  apiKey: "AIzaSyD07X5foiW-BtNUcECGqLWYvpG3RGxhfeI",
  authDomain: "bus-location-checker.firebaseapp.com",
  projectId: "bus-location-checker",
  storageBucket: "bus-location-checker.firebasestorage.app",
  messagingSenderId: "303522515021",
  appId: "1:303522515021:web:1024403e697f535a387404"
};

// Encryption Helpers (AES-256-CBC)
window.Encryption = {
  encrypt(text, keyBase64) {
    const key = CryptoJS.enc.Base64.parse(keyBase64);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return iv.toString(CryptoJS.enc.Base64) + ":" + encrypted.toString();
  },

  decrypt(encryptedText, keyBase64) {
    try {
      const parts = encryptedText.split(":");
      const iv = CryptoJS.enc.Base64.parse(parts[0]);
      const ciphertext = parts[1];
      const key = CryptoJS.enc.Base64.parse(keyBase64);
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error("Decryption failed", e);
      return "Error";
    }
  },

  generateKey() {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
  },

  generateInviteCode(busId, key) {
    return btoa(busId + ":" + key);
  },

  decodeInviteCode(code) {
    try {
      const decoded = atob(code);
      const parts = decoded.split(":");
      return { busId: parts[0], key: parts[1] };
    } catch (e) {
      return null;
    }
  }
};
