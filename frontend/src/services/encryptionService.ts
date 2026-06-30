import CryptoJS from 'crypto-js';

/**
 * Encrypt plain text using AES-256
 */
export const encryptMessage = (text: string, secretKey: string): string => {
  try {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
};

/**
 * Decrypt cipher text using AES-256
 */
export const decryptMessage = (cipherText: string, secretKey: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      // Fallback to original text if it was not encrypted
      return cipherText;
    }
    return decrypted;
  } catch (err) {
    // Fallback to original text if decryption fails
    return cipherText;
  }
};
