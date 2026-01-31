import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/themes/cyberpunk.css';
import '@/styles/themes/glass.css';
import '@/styles/themes/minimal.css';
import { RootLayoutClient } from '@/components/layout/RootLayoutClient';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'NexusFlow - Trustless Agent Economy',
  description: 'Autonomous yield optimization and agent management on the Superchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>
          <Header />
          <main className="pt-24 min-h-[calc(100vh-80px)]">
            {children}
          </main>
          <Footer />
        </RootLayoutClient>
      </body>
    </html>
  );
}
