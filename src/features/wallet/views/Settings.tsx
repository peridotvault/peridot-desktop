// @ts-ignore
import React, { useEffect, useRef, useState } from 'react';
import {
  getCurrency,
  getCurrencyByCode,
  getWalletInfo,
  saveCurrencyToWallet,
  saveRatesByCode,
} from '@shared/lib/utils/IndexedDb';
import { WalletInfo } from '../interfaces/Wallet';
import { Currency } from '../interfaces/Currency';
// import { faCircleInfo, faContactBook } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Settings = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [currency: string]: HTMLButtonElement | null }>({});
  // const settingLists = [
  //   {
  //     title: "Contact",
  //     icon: faContactBook,
  //   },
  //   {
  //     title: "About Peridot Wallet",
  //     icon: faCircleInfo,
  //   },
  // ];

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  async function fetchAllData() {
    try {
      const [currencyList, wallet] = await Promise.all([getCurrency(), getWalletInfo()]);
      setCurrencies(currencyList);
      setWalletInfo(wallet);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (walletInfo?.currency?.currency) {
      const activeRef = buttonRefs.current[walletInfo.currency.currency];
      if (activeRef && scrollRef.current) {
        activeRef.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [walletInfo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1; // sesuaikan kecepatan di sini
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const fetchAPICurrency = async (currency: string) => {
    const url = 'https://open.er-api.com/v6/latest/USD';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const cur = (await getCurrencyByCode(currency)) as Currency;
      const result = {
        currency_name: cur.currency_name,
        currency: cur.currency,
        symbol: cur.symbol,
        rates: json.rates[currency],
        flag_url: cur.flag_url,
      };
      await saveRatesByCode(currency, json.rates[currency]);
      await saveCurrencyToWallet(result);
      setWalletInfo({ currency: result });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="py-12 flex flex-col gap-12 relative">
      {/* Currencies  */}
      <div className="flex flex-col gap-6">
        <h2 className="mx-8 text-2xl">Currencies</h2>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto whitespace-nowrap px-8 gap-6 scrollbar-hide"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {currencies?.map((item, idx) => (
            <button
              key={idx}
              ref={(el) => {
                buttonRefs.current[item.currency] = el;
              }}
              className={`${
                walletInfo?.currency.currency == item.currency
                  ? 'border border-accent-foreground'
                  : ''
              } shadow-arise-sm p-6 w-40 rounded-xl shrink-0 flex flex-col justify-between aspect-6/7 text-start`}
              onClick={() => fetchAPICurrency(item.currency)}
            >
              <div className="w-8 rounded-full aspect-square bg-card overflow-hidden">
                <img src={item.flag_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-start w-full gap-1">
                <span className="font-bold">{item.symbol}</span>
                <span className="text-xs text-wrap">{item.currency_name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* <div className="flex flex-col gap-6 px-8">
        //  title  
        <h2 className="text-2xl">Preferences</h2>

        //  Contents  
        {settingLists.map((item, index) => (
          <button
            key={index}
            className="flex justify-between items-center rounded-xl  hover:scale-105 duration-300"
          >
            <div className="flex gap-4 items-center">
              <FontAwesomeIcon
                icon={item.icon}
                className="shadow-arise-sm p-4 rounded-lg"
              />
              <span>{item.title}</span>
            </div>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        ))}
      </div> */}
    </div>
  );
};
