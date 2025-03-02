// @ts-ignore
import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { Actor, HttpAgent } from "@dfinity/agent";
import { icrc1IdlFactory } from "../../hooks/idl/icrc1";
import { Principal } from "@dfinity/principal";

interface Metadata {
  balance: string | null;
  logo: string | null;
  decimals: bigint | null;
  name: string | null;
  symbol: string | null;
}

interface ICRC1CoinProps {
  canisterId: string;
  onBalanceUpdate?: (canisterId: string, balanceUsd: number) => void;
}

export const ICRC1Coin = ({ canisterId, onBalanceUpdate }: ICRC1CoinProps) => {
  const { wallet } = useWallet();
  const [icrc1, setIcrc1] = useState<Metadata>();
  const [priceUsd, setPriceUsd] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      if (wallet.principalId) {
        const result = await checkBalance(canisterId);
        setIcrc1(result);
      }
    }

    async function fetchMarketData() {
      try {
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/icp/tokens/${canisterId}`
        );
        if (!response.ok) {
          console.warn(
            `Token not found for canisterId: ${canisterId}. Status: ${response.status}`
          );
          return;
        }
        const data = await response.json();
        const price_usd = data.data.attributes.price_usd;
        setPriceUsd(price_usd);
      } catch (error) {
        setPriceUsd("0");
      }
    }

    fetchBalance();
    fetchMarketData();
  }, [wallet.principalId, canisterId]);

  // Calculate and update the USD balance whenever price or balance changes
  useEffect(() => {
    if (icrc1?.balance && priceUsd && priceUsd !== "0" && onBalanceUpdate) {
      const balanceUsd = parseFloat(priceUsd) * parseFloat(icrc1.balance);
      onBalanceUpdate(canisterId, balanceUsd);
    } else if (onBalanceUpdate) {
      // Set to 0 if there's no valid balance or price
      onBalanceUpdate(canisterId, 0);
    }
  }, [icrc1?.balance, priceUsd, canisterId, onBalanceUpdate]);

  async function checkBalance(icrc1CanisterId: string) {
    if (!wallet.principalId) {
      throw new Error("Not Logged in");
    }
    try {
      // Initialize agent with identity
      const agent = new HttpAgent({
        host: "https://ic0.app",
      });

      const actor = Actor.createActor(icrc1IdlFactory, {
        agent,
        canisterId: icrc1CanisterId,
      });

      // Call balance method
      const metadataResult = (await actor.icrc1_metadata()) as any[][];
      const balanceResult = await actor.icrc1_balance_of({
        owner: Principal.fromText(wallet.principalId),
        subaccount: [],
      });

      // Convert balance to number and format
      const standardBalance = Number(balanceResult) / 100000000;
      const result: Metadata = {
        balance: standardBalance.toString(),
        logo:
          canisterId == "ryjl3-tyaaa-aaaaa-aaaba-cai"
            ? "https://s3.coinmarketcap.com/static-gravity/image/2fb1bc84c1494178beef0822179d137d.png"
            : null,
        decimals: 0n,
        name: "",
        symbol: "",
      };
      for (const metadata of metadataResult) {
        const key = metadata[0];
        const value = metadata[1];

        switch (key) {
          case "icrc1:logo":
            result.logo = value.Text;
            break;
          case "icrc1:decimals":
            result.decimals = BigInt(value.Text || 0);
            break;
          case "icrc1:name":
            result.name = value.Text;
            break;
          case "icrc1:symbol":
            result.symbol = value.Text;
            break;
        }
      }

      return result;
    } catch (error) {
      const result: Metadata = {
        balance: null,
        logo: null,
        decimals: null,
        name: null,
        symbol: null,
      };
      return result;
    }
  }

  const formatUsd = (
    value: string | null,
    decimalPlaces: number = 2
  ): string => {
    if (value === null) return "";
    const number = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 1,
      maximumFractionDigits: decimalPlaces,
    }).format(number);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
          {icrc1?.logo != null ? (
            <img
              src={icrc1?.logo != null ? icrc1?.logo : "null"}
              alt=""
              className="w-full"
            />
          ) : (
            <div className="w-full h-full bg-background_disabled animate-pulse"></div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            {icrc1?.balance != null ? (
              <p>{icrc1?.balance}</p>
            ) : (
              <div className="w-12 h-5 bg-background_disabled rounded-full animate-pulse"></div>
            )}

            {icrc1?.symbol != null ? (
              <p>{icrc1?.symbol}</p>
            ) : (
              <div className="w-7 h-5 bg-background_disabled rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="text-xs">
            {icrc1?.name != null ? (
              <p>{icrc1?.name}</p>
            ) : (
              <div className="w-7 h-3 bg-background_disabled rounded-full animate-pulse mt-1"></div>
            )}
          </div>
        </div>
      </div>
      {priceUsd != null && priceUsd != "0" && icrc1?.balance != null ? (
        <div className="flex flex-col items-end">
          <p>
            {formatUsd(
              (
                parseFloat(priceUsd) * parseFloat(icrc1.balance)
              ).toLocaleString(),
              5
            )}
          </p>
          <p className="text-xs text-text_disabled">{formatUsd(priceUsd)}</p>
        </div>
      ) : (
        <div className="w-12 h-5 bg-background_disabled rounded-full animate-pulse"></div>
      )}
    </div>
  );
};
