import { NextRequest } from 'next/server';

/**
 * Get the external-facing origin, accounting for reverse proxy headers.
 *
 * Inside the Base44 preview the app receives requests on an internal sandbox
 * host that browsers (and WorkOS) cannot reach, so when the platform suffix
 * is present the public preview origin is derived from it.
 */
export function getOrigin(request: NextRequest): string {
  if (process.env.BASE44_PUBLIC_HOST_SUFFIX) {
    return `https://3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`;
  }
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('host');
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  if (host && host !== '0.0.0.0:3000' && host !== 'localhost:3000') {
    return `${request.nextUrl.protocol}//${host}`;
  }
  return request.nextUrl.origin;
}
