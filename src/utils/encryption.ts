// Simple encryption utilities for invite links
const ENCRYPTION_KEY = 'PyramidingSecure2024'

export function encryptRef(phoneNumber: string): string {
  try {
    // Simple XOR encryption with base64 encoding
    const key = ENCRYPTION_KEY
    let encrypted = ''
    
    for (let i = 0; i < phoneNumber.length; i++) {
      const charCode = phoneNumber.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      encrypted += String.fromCharCode(charCode)
    }
    
    // Base64 encode and make URL safe
    return btoa(encrypted)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  } catch {
    return phoneNumber // fallback to plain if encryption fails
  }
}

export function decryptRef(encryptedRef: string): string {
  try {
    // Reverse the URL safe base64
    let base64 = encryptedRef
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    
    const encrypted = atob(base64)
    const key = ENCRYPTION_KEY
    let decrypted = ''
    
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      decrypted += String.fromCharCode(charCode)
    }
    
    return decrypted
  } catch {
    return encryptedRef // fallback to original if decryption fails
  }
}
