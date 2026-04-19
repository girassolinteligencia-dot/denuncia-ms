import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_HEX = process.env.ENCRYPTION_KEY ?? ''

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length < 64) {
    throw new Error(
      'ENCRYPTION_KEY inválida. Gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
  return Buffer.from(KEY_HEX, 'hex')
}

/**
 * Criptografa dados usando AES-256-GCM.
 * Retorna string no formato: iv:tag:ciphertext (base64)
 */
export async function encryptData(plaintext: string): Promise<string> {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

/**
 * Descriptografa dados criptografados por `encryptData`.
 */
export async function decryptData(ciphertext: string): Promise<string> {
  const key = getKey()
  const parts = ciphertext.split(':')

  if (parts.length !== 3) {
    throw new Error('Formato de dado criptografado inválido')
  }

  const [ivB64, tagB64, encryptedB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8')
}
