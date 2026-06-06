/**
 * Global Configuration and Utilities
 *
 * NOTE: The firebaseConfig below is the primary source of truth for all web/mobile components.
 * If you update it here, ensure it's also updated in the Service Worker (if applicable)
 * and mobile/cordova/www/js/utils.js.
 */

// Firebase Configuration provided by user
window.firebaseConfig = {
  apiKey: "AIzaSyD5IZciT8rwHRxTzNvvo3i335ixwVExLTM",
  authDomain: "bus-location-checker-service.firebaseapp.com",
  projectId: "bus-location-checker-service",
  storageBucket: "bus-location-checker-service.firebasestorage.app",
  messagingSenderId: "371379487729",
  appId: "1:371379487729:web:3dd7a10103f33fc683ba50",
  measurementId: "G-GCVHKY0X7F"
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

/**
 * Maintenance Check System
 */
(async function checkMaintenance() {
  const currentPath = window.location.pathname;
  if (currentPath.endsWith('maintenance.html')) return;

  // Determine root path for setting.txt (supporting both root and sub-directory loads)
  const scripts = document.getElementsByTagName('script');
  let root = './';
  for (let s of scripts) {
    if (s.src.includes('utils.js?root=1')) {
      root = '../../';
      break;
    }
  }

  try {
    const res = await fetch(root + 'setting.txt?v=' + Date.now());
    if (!res.ok) return;
    const text = await res.text();
    const line = text.trim();
    console.log("[Maintenance] Setting:", line);

    if (line === 'true') {
      window.location.href = root + 'maintenance.html';
      return;
    }

    // Format support: true 2026/06/06/09:00~13:00 or true(2026/06/06/9:00〜13:00)
    const match = line.match(/true[^\d]*([\d\/]+)\/([\d:]+)\s*[~〜]\s*([\d:]+)/);
    if (match) {
      const dateStr = match[1]; // YYYY/MM/DD
      const startTimeStr = match[2]; // HH:mm
      const endTimeStr = match[3]; // HH:mm

      const parseTime = (dStr, tStr) => {
        const [h, m] = tStr.split(':').map(Number);
        const parts = dStr.split('/').map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2]); // month is 0-indexed
        d.setHours(h, m, 0, 0);
        return d;
      };

      const startDate = parseTime(dateStr, startTimeStr);
      let endDate = parseTime(dateStr, endTimeStr);
      const now = new Date();

      if (now >= startDate && now <= endDate) {
        console.log("[Maintenance] Within window. Redirecting...");
        window.location.href = root + 'maintenance.html?period=' + encodeURIComponent(dateStr + ' ' + startTimeStr + '〜' + endTimeStr);
      }
    }
  } catch (e) {
    console.error("Maintenance check failed", e);
  }
})();
