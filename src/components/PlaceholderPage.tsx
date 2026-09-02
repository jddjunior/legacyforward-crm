import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8">
      <h1 className="text-display mb-2">{title}</h1>
      <p className="text-ink-muted text-sm mb-8">{description}</p>
      <div className="card p-16 text-center">
        <Construction size={40} className="mx-auto text-ink-subtle mb-4" />
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-ink-muted text-sm max-w-md mx-auto">
          This module is part of the roadmap. The data model and API integration for this feature are defined in BACKEND.md and ready to be built.
        </p>
      </div>
    </div>
  );
}
