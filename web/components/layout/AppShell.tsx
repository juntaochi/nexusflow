'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLanding = pathname === '/';

  if (isLanding) {
    return (
      <>
        <Header />
        <main className="pt-24 min-h-[calc(100vh-80px)]">
          {children}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="md:ml-64 min-h-screen flex flex-col">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 pt-6 pb-8 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
