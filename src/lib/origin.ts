import { NextRequest } from 'next/server';

/** Get the external-facing origin, accounting for reverse proxy headers. */
export function getOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('host');
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  if (host && host !== '0.0.0.0:3000' && host !== 'localhost:3000') {
    return `${request.nextUrl.protocol}//${host}`;
  }
  return request.nextUrl.origin;
}
