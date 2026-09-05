'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * The WorkOS hosted sign-in page refuses to render inside embedded frames
 * (CSP frame-ancestors), so when the app runs inside an iframe preview
 * (e.g. the Base44 preview) the auth flow must open in a new tab.
 * When served top-level, a normal in-page navigation is used.
 *
 * The frame check runs in an effect (not during render) to keep the server
 * and client markup identical and avoid a hydration mismatch.
 */
export default function SignInButton() {
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    setIsFramed(window.top !== window.self);
  }, []);

  return (
    <Link
      href="/api/auth/login"
      target={isFramed ? '_blank' : undefined}
      rel={isFramed ? 'noopener' : undefined}
      className="btn btn-primary w-full justify-center"
    >
      Sign in with WorkOS
    </Link>
  );
}
