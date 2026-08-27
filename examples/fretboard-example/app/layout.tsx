import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fretboard Example — A Aeolian Triads in Scale',
  description: 'Self-contained fretboard example for graphical upgrade',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
