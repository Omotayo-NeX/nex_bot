'use client';

import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from './contexts/SettingsContext';

export function Providers({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </SessionProvider>
  );
}