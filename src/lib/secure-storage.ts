import CryptoJS from 'crypto-js'

const SECRET_KEY =
  import.meta.env.VITE_CRYPTO_SECRET_KEY || 'your-super-secret-key'

export const encryptData = (data: unknown): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

export const decryptData = <T>(encryptedData: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
    if (decryptedData) {
      return JSON.parse(decryptedData) as T
    }
    return null
  } catch (error) {
    // We just log a gentle warning instead of the full error stack,
    // as it usually just means± the encryption key changed or localStorage is stale.
    console.warn('Session decryption failed. The corrupted session will be cleared.')
    return null
  }
}
