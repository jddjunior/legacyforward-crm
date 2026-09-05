'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PitchCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter the code from your proposal.');
      return;
    }
    router.push(`/pitch/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="input mono"
        placeholder="e.g. demo"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError('');
        }}
      />
      {error && <p className="text-[12px] text-[#ff8f8f]">{error}</p>}
      <button
        type="submit"
        className="btn w-full justify-center bg-[#ffc400] border-[#ffc400] text-[#14141a] hover:bg-[#ffd633] hover:border-[#ffd633] hover:text-[#14141a]"
      >
        View proposal →
      </button>
    </form>
  );
}
