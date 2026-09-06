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
 *
 * "Remember me" is chosen here, before the redirect, and travels to WorkOS in
 * a signed `state` param that the callback turns into a 60-day session.
 */
export default function SignInButton() {
  const [isFramed, setIsFramed] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    setIsFramed(window.top !== window.self);
  }, []);

  return (
    <div>
      <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          name="remember"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 rounded-[4px] border-[#d4d4d8] text-[#14141a] accent-[#14141a] cursor-pointer"
        />
        <span className="text-[13px] text-[#5f5f66]">Remember me for 60 days</span>
      </label>

      <Link
        href={remember ? '/api/auth/login?remember=1' : '/api/auth/login'}
        target={isFramed ? '_blank' : undefined}
        rel={isFramed ? 'noopener' : undefined}
        className="btn btn-primary w-full justify-center"
      >
        Sign in with WorkOS
      </Link>
    </div>
  );
}
