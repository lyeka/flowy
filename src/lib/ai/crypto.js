/**
 * [INPUT]: Web Crypto API
 * [OUTPUT]: encryptKey, decryptKey - API Key 加密/解密函数
 * [POS]: AI 模块的安全层，保护用户 API Key
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const ENCRYPTION_KEY_NAME = 'gtd-ai-encryption-key-v1'

// ============================================================
// Encryption Key Management
// ============================================================

async function getEncryptionKey() {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ENCRYPTION_KEY_NAME),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('gtd-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// ============================================================
// Encryption / Decryption
// ============================================================

export async function encryptKey(apiKey) {
  if (!apiKey) return ''

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    return btoa(JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    }))
  } catch (error) {
    console.error('Encryption failed:', error)
    return ''
  }
}

export async function decryptKey(encryptedKey) {
  if (!encryptedKey) return ''

  try {
    const { iv, data } = JSON.parse(atob(encryptedKey))
    const key = await getEncryptionKey()

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    )

    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error('Decryption failed:', error)
    return ''
  }
}
