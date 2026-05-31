'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { useMemo } from 'react';

export function TonConnectProvider({ children }: { children: React.ReactNode }) {
  const manifestUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_TON_MANIFEST_URL || 'https://swap.ton-app.com/tonconnect-manifest.json';
  }, []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
