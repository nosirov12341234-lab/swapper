import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TonConnectProvider } from '@/components/TonConnectProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TON Swap Platform',
  description: 'PancakeSwap style DEX on The Open Network (TON)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <TonConnectProvider>{children}</TonConnectProvider>
      </body>
    </html>
  );
}
