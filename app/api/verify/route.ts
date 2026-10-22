import { checkBotId } from 'botid/server';
import {
  hasVerificationCookie,
  issueVerificationCookie,
} from '@/src/lib/botid-cookie';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  // Cegah request lintas origin
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return new Response('Forbidden', { status: 403, headers });
  }

  try {
    // Jika sudah memiliki cookie verifikasi yang sah, lewati pengecekan
    if (await hasVerificationCookie()) {
      return new Response(null, { status: 204, headers });
    }

    const isDev = process.env.NODE_ENV !== 'production';

    const result = await checkBotId({
      advancedOptions: { checkLevel: 'basic' },
      ...(isDev ? { developmentOptions: { bypass: 'HUMAN' } } : {}),
    });

    if (
      !result.isHuman ||
      result.isBot ||
      result.isVerifiedBot ||
      (!isDev && result.bypassed)
    ) {
      return new Response('Verification failed', { status: 403, headers });
    }

    await issueVerificationCookie();
    return new Response(null, { status: 204, headers });
  } catch (error) {
    console.error('[BotID Verification Error]:', error);
    return new Response('Verification unavailable', { status: 503, headers });
  }
}
