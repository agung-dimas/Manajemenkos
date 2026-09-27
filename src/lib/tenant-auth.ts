import crypto from 'crypto'

const SECRET_KEY = process.env.NEXTAUTH_SECRET || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-secret-key-123'

export function signTenantSession(tenantId: string): string {
  const hmac = crypto.createHmac('sha256', SECRET_KEY)
  hmac.update(tenantId)
  const signature = hmac.digest('hex')
  return `${tenantId}.${signature}`
}

export function verifyTenantSession(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null

  const parts = cookieValue.split('.')
  if (parts.length !== 2) return null

  const [tenantId, signature] = parts

  const hmac = crypto.createHmac('sha256', SECRET_KEY)
  hmac.update(tenantId)
  const expectedSignature = hmac.digest('hex')

  // Prevent timing attacks using timingSafeEqual
  try {
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return tenantId
    }
  } catch (err) {
    // If lengths are different, it will throw, meaning invalid signature
    if (signature === expectedSignature) return tenantId
  }

  return null
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) return false
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return hash === key
}
