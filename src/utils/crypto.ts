import CryptoJS from 'crypto-js';

// In a real app, this would be in .env. Using the same key as backend for consistency.
const SECRET_KEY = '7f8d9b2a1c6e5f3d4b0a9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8';

/**
 * Decrypts a buffer/arrayBuffer that was encrypted using aes-256-cbc on the backend
 * @param encryptedData The encrypted ArrayBuffer
 * @returns Decrypted ArrayBuffer
 */
export const decryptBuffer = async (encryptedData: ArrayBuffer): Promise<ArrayBuffer> => {
  // CryptoJS works with WordArrays. This is a bit complex for large files,
  // but for avatars (< 1MB) it's acceptable.
  
  // Note: The backend uses 'crypto' (Node.js), which adds a 16-byte IV at the beginning.
  const fullIv = new Uint8Array(encryptedData.slice(0, 16));
  const ciphertext = encryptedData.slice(16);

  // Convert to CryptoJS format
  const iv = CryptoJS.lib.WordArray.create(fullIv as any);
  const key = CryptoJS.SHA256(SECRET_KEY);
  
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.lib.WordArray.create(new Uint8Array(ciphertext) as any) } as any,
    key,
    { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );

  // Convert WordArray back to Uint8Array
  const typedArray = new Uint8Array(decrypted.sigBytes);
  for (let i = 0; i < decrypted.sigBytes; i++) {
    typedArray[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }

  return typedArray.buffer;
};
