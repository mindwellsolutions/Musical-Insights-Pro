import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MIDIProviders } from '@/components/providers/MIDIProviders';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthPrefetchProvider } from '@/components/providers/AuthPrefetchProvider';
import { NoteNotationProvider } from '@/contexts/NoteNotationContext';
import { AdminProvider } from '@/contexts/AdminContext';
import AppSettingsButton from '@/components/AppSettingsButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Musical Insights Pro',
  description: 'Professional guitar scale visualization and music theory tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthPrefetchProvider>
            <AdminProvider>
              <NoteNotationProvider>
                <MIDIProviders>
                  {children}
                  <AppSettingsButton />
                </MIDIProviders>
              </NoteNotationProvider>
            </AdminProvider>
          </AuthPrefetchProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
