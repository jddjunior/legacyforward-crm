export const SESSION_COOKIE = 'lf-session';

/**
 * Session cookie options. The app is served inside a cross-site preview iframe,
 * so the cookie must be `SameSite=None; Secure` to be sent at all. Set
 * COOKIE_CROSS_SITE=false for plain-http local use, where `lax` is required.
 */
export function sessionCookieOptions() {
  const crossSite = process.env.COOKIE_CROSS_SITE !== 'false';
  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    // CHIPS: browsers that block third-party cookies still accept a partitioned
    // one, which is what the cross-site preview iframe needs.
    ...(crossSite ? { partitioned: true } : {}),
  };
}
