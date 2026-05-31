'use client';

import React, { useState, useEffect } from 'react';
import { ConnectButton } from './ConnectButton';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, OpenedContract, Contract, ContractProvider, Sender, Cell, beginCell, toNano as tonCoreToNano } from 'ton-core';
import { fromNano, toNano } from '@/utils/ton';
import { ArrowDownIcon } from '@heroicons/react/24/solid';

// Dummy token data for demonstration
interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

const TON_TOKEN: Token = {
  address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMoA', // Dummy TON address
  symbol: 'TON',
  name: 'Toncoin',
  decimals: 9,
};

const JT_TOKEN: Token = {
  address: 'EQBYBG9WcM08g7eA-d7t502oVw6fEwA3B-T-B12Z0Yx2Z0Y', // Dummy Jetton Master for example
  symbol: 'JT',
  name: 'Jetton Token',
  decimals: 9,
};

const availableTokens: Token[] = [TON_TOKEN, JT_TOKEN];

export function SwapCard() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromToken, setFromToken] = useState<Token>(TON_TOKEN);
  const [toToken, setToToken] = useState<Token>(JT_TOKEN);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const COMMISSION_PERCENT = parseFloat(process.env.COMMISSION_PERCENT || '0.5'); // 0.5 for 0.5%
  const ADMIN_FEE_WALLET = process.env.ADMIN_FEE_WALLET || 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMoA'; // Default to a dummy address

  // This is a simplified simulation of swap rate
  // In a real DEX, this would involve fetching prices from a liquidity pool or oracle
  const getSwapRate = (from: Token, to: Token) => {
    if (from.symbol === 'TON' && to.symbol === 'JT') return 0.5; // 1 TON = 0.5 JT
    if (from.symbol === 'JT' && to.symbol === 'TON') return 2;   // 1 JT = 2 TON
    return 1; // Fallback
  };

  useEffect(() => {
    if (fromAmount) {
      const rate = getSwapRate(fromToken, toToken);
      setToAmount((parseFloat(fromAmount) * rate).toFixed(fromToken.decimals));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Only allow numbers and one decimal point
      setFromAmount(value);
    }
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  const handleSwap = async () => {
    if (!wallet) {
      setError('Please connect your wallet first.');
      tonConnectUI.openModal();
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount to swap.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountToSwap = toNano(fromAmount);
      const commissionAmount = tonCoreToNano(
        (parseFloat(fromAmount) * (COMMISSION_PERCENT / 100)).toString()
      ).add(tonCoreToNano('0.02')); // Add a small base fee for network transaction costs
      const totalAmount = amountToSwap.add(commissionAmount);

      // In a real scenario, you'd interact with a smart contract (e.g., a DEX pool)
      // For this example, we'll simulate by sending funds to a dummy swap contract address
      // and commission to the admin wallet.
      const dummySwapContractAddress = Address.parse('UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJK0'); // Dummy address

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
        messages: [
          {
            address: dummySwapContractAddress.toString(), // The address of the DEX pool contract
            amount: amountToSwap.toString(),
            payload: beginCell().storeUint(0, 32).storeStringTail('Swap message').endCell().toBoc().toString('base64'),
          },
          {
            address: ADMIN_FEE_WALLET,
            amount: commissionAmount.toString(),
            payload: beginCell().storeUint(0, 32).storeStringTail('Commission').endCell().toBoc().toString('base64'),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      alert('Swap successful!');
      setFromAmount('');
      setToAmount('');
    } catch (e) {
      console.error('Swap failed:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during swap.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-effect-dark p-8 rounded-3xl shadow-xl w-full max-w-md backdrop-filter backdrop-blur-lg border border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Swap</h2>
        <ConnectButton />
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-30 border border-red-400 text-red-300 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-4 bg-gray-800 bg-opacity-60 p-4 rounded-xl border border-gray-700 transition-all duration-300 hover:border-tonBlue">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="fromAmount" className="text-gray-400 text-sm">You pay</label>
          <span className="text-gray-400 text-sm">Balance: 0.00 {fromToken.symbol} (Dummy)</span>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            id="fromAmount"
            placeholder="0.0"
            className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none p-0 border-none"
            value={fromAmount}
            onChange={handleFromAmountChange}
            disabled={loading}
          />
          <select
            className="ml-2 bg-gray-700 bg-opacity-50 text-white rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-tonBlue transition-all duration-200"
            value={fromToken.address}
            onChange={(e) => setFromToken(availableTokens.find(token => token.address === e.target.value) || fromToken)}
            disabled={loading}
          >
            {availableTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center -mt-8 mb-4 z-10 relative">
        <button
          onClick={handleSwapTokens}
          className="bg-gray-700 bg-opacity-70 border border-gray-600 p-2 rounded-full text-white shadow-md hover:bg-tonBlue transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-tonBlue"
          disabled={loading}
        >
          <ArrowDownIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 bg-gray-800 bg-opacity-60 p-4 rounded-xl border border-gray-700 transition-all duration-300 hover:border-tonBlue">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="toAmount" className="text-gray-400 text-sm">You receive</label>
          <span className="text-gray-400 text-sm">Balance: 0.00 {toToken.symbol} (Dummy)</span>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            id="toAmount"
            placeholder="0.0"
            className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none p-0 border-none"
            value={toAmount}
            readOnly
            disabled={loading}
          />
          <select
            className="ml-2 bg-gray-700 bg-opacity-50 text-white rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-tonBlue transition-all duration-200"
            value={toToken.address}
            onChange={(e) => setToToken(availableTokens.find(token => token.address === e.target.value) || toToken)}
            disabled={loading}
          >
            {availableTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSwap}
        className={`
          w-full py-4 rounded-xl text-lg font-bold transition-all duration-300
          ${!wallet || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-tonGreen hover:bg-green-700 transform hover:scale-105'}
          text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500
        `}
        disabled={!wallet || loading}
      >
        {loading ? 'Swapping...' : 'Swap'}
      </button>

      {wallet && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Connected: {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
        </p>
      )}
    </div>
  );
}
