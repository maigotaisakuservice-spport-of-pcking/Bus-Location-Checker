import CryptoJS from "crypto-js";

/**
 * Encrypts a string using AES-256-CBC.
 * Returns the format `iv:ciphertext`.
 */
export const encrypt = (text: string, keyBase64: string): string => {
  const key = CryptoJS.enc.Base64.parse(keyBase64);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return iv.toString(CryptoJS.enc.Base64) + ":" + encrypted.toString();
};

/**
 * Decrypts a string in the format `iv:ciphertext`.
 */
export const decrypt = (encryptedText: string, keyBase64: string): string => {
  try {
    const [ivBase64, ciphertext] = encryptedText.split(":");
    const key = CryptoJS.enc.Base64.parse(keyBase64);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Decryption failed", e);
    return "Error: Decryption failed";
  }
};

/**
 * Generates a random 32-byte key encoded as Base64.
 */
export const generateKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
};

/**
 * Encodes busId and key into an invitation code.
 */
export const generateInviteCode = (busId: string, key: string): string => {
  return btoa(`${busId}:${key}`);
};

/**
 * Decodes an invitation code into busId and key.
 */
export const decodeInviteCode = (code: string): { busId: string; key: string } => {
  const decoded = atob(code);
  const [busId, key] = decoded.split(":");
  return { busId, key };
};
