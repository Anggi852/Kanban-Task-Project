import 'dotenv/config';

export const jwtContants = {
  secret: process.env.JWT_SECRET as string,
  accessTokenTtl: '15m',
  refreshTokenTtl: '7d',
  refreshTokenTtlMs: 7 * 24 * 60 * 60 * 1000,
} as const;

export const googleOAuthConstants = {
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackUrl:
    process.env.GOOGLE_CALLBACK_URL ??
    'http://localhost:8001/auth/google/callback',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
} as const;
