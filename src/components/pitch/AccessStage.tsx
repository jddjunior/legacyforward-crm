'use client';

import { useState } from 'react';

// Stage 03 — portal access: create the login that owns approvals,
// pricing, and billing.
export default function AccessStage({ onCreated }: { onCreated: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twofa, setTwofa] = useState(false);
  const [error, setError] = useState('');

  function createAccess() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Use a valid work email address.');
      return;
    }
    if (password.trim().length < 10) {
      setError('Password needs at least 10 characters.');
      return;
    }
    setError('');
    onCreated();
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto px-[30px] py-7">
      <div className="max-w-[520px]">
        <div className="text-[11.5px] font-semibold tracking-[0.14em] uppercase text-[#146c43]">Step 03 · Portal access</div>
        <h2 className="mt-[11px] text-[26px] font-normal tracking-[-0.025em]">Create your portal login</h2>
        <p className="mt-2.5 text-sm leading-[1.65] text-[#45454d]">
          Payment received. This account owns approvals, pricing, and billing — you can invite approvers and viewers once
          you are inside.
        </p>

        <div className="mt-5 border border-[#e9e6de] rounded-[13px] p-[18px]">
          <label className="block">
            <span className="block text-[11px] font-semibold tracking-[0.09em] uppercase text-[#5f5f66]">Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full h-[42px] rounded-[11px] border border-[#c6c6ce] px-[11px] text-[13.5px]"
            />
          </label>
          <label className="block mt-3">
            <span className="block text-[11px] font-semibold tracking-[0.09em] uppercase text-[#5f5f66]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 10 characters"
              className="mt-1.5 w-full h-[42px] rounded-[11px] border border-[#c6c6ce] px-[11px] text-[13.5px]"
            />
          </label>
          <div className="mt-3.5 flex items-center gap-3">
            <button
              onClick={() => setTwofa(!twofa)}
              aria-pressed={twofa}
              className={`w-[34px] h-5 rounded-full border-none cursor-pointer flex items-center px-[2px] transition-colors ${
                twofa ? 'bg-[#146c43] justify-end' : 'bg-[#eaeaef] justify-start'
              }`}
            >
              <span className="block w-[18px] h-[18px] rounded-full bg-white" />
            </button>
            <span className="text-[12.5px]">Require a code from my phone at sign-in</span>
          </div>
          {error && <div className="mt-3 text-[12.5px] font-medium text-[#b02a12]">{error}</div>}
          <button
            onClick={createAccess}
            className="mt-4 w-full h-11 rounded-full border-none bg-[#146c43] text-white text-[13.5px] font-semibold cursor-pointer hover:bg-[#0f5132]"
          >
            Create access and start onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
