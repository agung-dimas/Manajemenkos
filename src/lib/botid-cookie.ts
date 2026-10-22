import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = '__Host-botid-verification';
const LIFETIME_SECONDS = 5 * 60; // 5 menit

function getSigningKey(): Uint8Array {
  const secret = process.env.BOTID_COOKIE_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) {
    throw new Error('BOTID_COOKIE_SECRET harus dikonfigurasi 64 karakter hex');
  }
  return Buffer.from(secret, 'hex');
}

export async function hasVerificationCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const key = getSigningKey();
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
      issuer: 'manajemen-kost',
      audience: 'botid-verification',
      requiredClaims: ['iat', 'exp'],
      maxTokenAge: '5m',
    });
    return payload.purpose === 'botid-verification';
  } catch {
    return false;
  }
}

export async function issueVerificationCookie(): Promise<void> {
  const token = await new SignJWT({ purpose: 'botid-verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('manajemen-kost')
    .setAudience('botid-verification')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getSigningKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: LIFETIME_SECONDS,
  });
}
