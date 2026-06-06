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
  let root = '/';
  let isSubDir = false;
  for (let s of scripts) {
    if (s.src.includes('utils.js?root=1')) {
      root = '../../';
      isSubDir = true;
    }
  }

  try {
    const res = await fetch(root + 'setting.txt?v=' + Date.now());
    const text = await res.text();
    const line = text.trim();

    if (line === 'true') {
      window.location.href = (isSubDir ? root : '') + 'maintenance.html';
      return;
    }

    // Format: true 2026/02/08/23:00~24:30
    if (line.startsWith('true ')) {
      const periodStr = line.replace('true ', '');
      const parts = periodStr.split('~');
      if (parts.length === 2) {
        const startRaw = parts[0]; // 2026/02/08/23:00
        const endRaw = parts[1];   // 24:30

        const startParts = startRaw.split('/');
        const dateStr = startParts.slice(0, 3).join('/'); // 2026/02/08
        const startTimeStr = startParts[3]; // 23:00

        const parseTime = (dStr, tStr) => {
          const [h, m] = tStr.split(':').map(Number);
          const d = new Date(dStr);
          d.setHours(h, m, 0, 0);
          return d;
        };

        const startDate = parseTime(dateStr, startTimeStr);
        const endDate = parseTime(dateStr, endRaw);
        const now = new Date();

        if (now >= startDate && now <= endDate) {
          window.location.href = (isSubDir ? root : '') + 'maintenance.html?period=' + encodeURIComponent(periodStr);
        }
      }
    }
  } catch (e) {
    console.error("Maintenance check failed", e);
  }
})();
