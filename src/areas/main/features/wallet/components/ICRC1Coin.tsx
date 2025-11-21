// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { Principal } from '@dfinity/principal';
import { ICRC1Metadata } from '../interfaces/Coin';
import { WalletInfo } from '../interfaces/Wallet';
import { getWalletInfo } from '@shared/utils/IndexedDb';
import { checkBalance } from '../blockchain/icp/services/ICPCoinService';

interface ICRC1CoinProps {
  canisterId: string;
  onBalanceUpdate?: (canisterId: string, balanceUsd: number, balanceToken: number) => void | number;
}

export const ICRC1Coin = ({ canisterId, onBalanceUpdate }: ICRC1CoinProps) => {
  const { wallet } = useWallet();
  const [icrc1, setIcrc1] = useState<ICRC1Metadata>();
  const [rates, setRates] = useState<string | null>(null);
  const [currency, setCurrency] = useState<WalletInfo | null>(null);

  async function fetchBalance() {
    if (wallet.principalId) {
      const result = await checkBalance(Principal.fromText(canisterId), wallet);
      setIcrc1(result);
    }
  }

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const wallet = await getWalletInfo();
        setCurrency(wallet);
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/icp/tokens/${canisterId}`,
        );
        if (!response.ok) {
          console.warn(`Token not found for canisterId: ${canisterId}. Status: ${response.status}`);
          return;
        }
        const data = await response.json();
        const price_usd: Number = data.data.attributes.price_usd * Number(wallet?.currency.rates);
        setRates(price_usd.toString());
      } catch (error) {
        setRates('0');
      }
    }

    fetchBalance();
    fetchMarketData();

    // Polling setiap 5 detik untuk update balance
    const interval = setInterval(() => {
      fetchBalance();
    }, 5000);

    return () => clearInterval(interval);
  }, [wallet.principalId, canisterId]);

  useEffect(() => {
    if (!onBalanceUpdate) return;

    if (icrc1?.balance != null) {
      const balanceUsd = rates && rates !== '0' ? parseFloat(rates) * icrc1.balance : 0;
      onBalanceUpdate(canisterId, balanceUsd, icrc1.balance);
    } else {
      // belum ada balance: tetap kirim 0 agar parent bisa reset
      onBalanceUpdate(canisterId, 0, 0);
    }
  }, [icrc1?.balance, rates, canisterId, onBalanceUpdate]);

  const formatCurrency = (value: string | null, decimalPlaces: number = 2): string => {
    if (value === null) return '';
    const number = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency?.currency.currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: decimalPlaces,
    }).format(number);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
          {canisterId == 'ryjl3-tyaaa-aaaaa-aaaba-cai' || icrc1?.logo != null ? (
            <img
              src={
                canisterId == 'ryjl3-tyaaa-aaaaa-aaaba-cai'
                  ? './assets/logo-icp.svg'
                  : icrc1?.logo != null
                    ? icrc1?.logo
                    : 'null'
              }
              alt=""
              className={`w-full ${canisterId == 'ryjl3-tyaaa-aaaaa-aaaba-cai' ? 'p-3' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-foreground/20 animate-pulse"></div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            {icrc1?.balance != null ? (
              <p>{icrc1?.balance}</p>
            ) : (
              <div className="w-12 h-5 bg-foreground/20 rounded-full animate-pulse"></div>
            )}

            {icrc1?.symbol != null ? (
              <p>{icrc1?.symbol}</p>
            ) : (
              <div className="w-7 h-5 bg-foreground/20 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="text-xs text-start">
            {icrc1?.name != null ? (
              <p>{icrc1?.name}</p>
            ) : (
              <div className="w-7 h-3 bg-foreground/20 rounded-full animate-pulse mt-1"></div>
            )}
          </div>
        </div>
      </div>
      {rates != null && rates != '0' && icrc1?.balance != null ? (
        <div className="flex flex-col items-end">
          <p>{formatCurrency((parseFloat(rates) * icrc1.balance).toLocaleString(), 2)}</p>
          <p className="text-xs text-card-foreground">{formatCurrency(rates)}</p>
        </div>
      ) : (
        <div className="w-12 h-5 bg-foreground/20 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};
