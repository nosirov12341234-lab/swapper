'use client';

import { useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

export function ConnectButton() {
  const [tonConnectUI] = useTonConnectUI();
  const [buttonText, setButtonText] = useState('Connect Wallet');

  useEffect(() => {
    if (tonConnectUI.connected) {
      setButtonText('Wallet Connected');
    } else {
      setButtonText('Connect Wallet');
    }
  }, [tonConnectUI.connected]);

  const handleConnectClick = () => {
    if (tonConnectUI.connected) {
      tonConnectUI.disconnect();
    } else {
      tonConnectUI.openModal();
    }
  };

  return (
    <button
      onClick={handleConnectClick}
      className={`
        px-6 py-3 rounded-xl font-semibold transition-all duration-300
        ${tonConnectUI.connected ? 'bg-tonGreen hover:bg-green-700' : 'bg-tonBlue hover:bg-blue-700'}
        text-white shadow-lg transform hover:scale-105
      `}
    >
      {buttonText}
    </button>
  );
}
