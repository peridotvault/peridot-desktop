import localforage from 'localforage';

import { Currency } from '../../features/wallet/interfaces/Currency';
import theCurrencies from './../../assets/json/currencies.json';
import { WalletInfo } from '../../features/wallet/interfaces/Wallet';
import { UserInterface } from '../../interfaces/user/UserInterface';

// ✅ User
export async function saveUserInfo(user: UserInterface) {
  try {
    await localforage.setItem('user-info', user);
    console.log('Successfully');
  } catch (error) {
    console.error;
  }
}

export async function getUserInfo(): Promise<UserInterface | null> {
  const user = await localforage.getItem<UserInterface>('user-info');
  return user;
}

// Currency
export async function getCurrency(): Promise<Currency[] | null> {
  let currency = await localforage.getItem<Currency[]>('currencies');
  if (!currency) {
    currency = theCurrencies as Currency[];
    saveCurrency(theCurrencies);
  }
  return currency;
}

export async function getCurrencyByCode(code: string): Promise<Currency | undefined> {
  const allCurrency = (await getCurrency()) as Currency[];
  const currency = allCurrency.find((item) => item.currency === code);
  return currency;
}

export async function saveCurrency(currencies: Currency[]) {
  try {
    await localforage.setItem('currencies', currencies);
    console.log('Successfully');
  } catch (error) {
    console.error;
  }
}

export async function saveRatesByCode(
  code: string,
  rates: number,
): Promise<Currency[] | undefined> {
  const allCurrency = (await getCurrency()) as Currency[];
  const updated = allCurrency.map((item) => {
    if (item.currency === code) {
      return { ...item, rates };
    }
    return item;
  });
  await saveCurrency(updated);
  const result = updated.filter((item) => item.currency === code);
  return result;
}

// Wallet
export async function saveCurrencyToWallet(currency: Currency) {
  try {
    const wallet = { currency: currency } as WalletInfo;
    await localforage.setItem('wallet-info', wallet);
  } catch (error) {
    console.error;
  }
}

export async function getWalletInfo(): Promise<WalletInfo | null> {
  const wallet = await localforage.getItem<WalletInfo>('wallet-info');
  return wallet;
}
