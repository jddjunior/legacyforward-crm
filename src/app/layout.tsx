import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LegacyForward CRM',
  description: 'Multi-tenant CRM & agency operations platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
