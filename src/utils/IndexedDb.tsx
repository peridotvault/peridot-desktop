import localforage from "localforage";
import { MetadataUser } from "../interfaces/User";
import { Coin } from "../features/wallet/interfaces/Coin";
import { Currency } from "../features/wallet/interfaces/Currency";
import theCurrencies from "./../assets/json/currencies.json";
import { WalletInfo } from "../features/wallet/interfaces/Wallet";

// ✅ User
export async function saveUserInfo(user: MetadataUser) {
  try {
    await localforage.setItem("user-info", user);
    console.log("Successfully");
  } catch (error) {
    console.error;
  }
}

export async function getUserInfo(): Promise<MetadataUser | null> {
  const user = await localforage.getItem<MetadataUser>("user-info");
  return user;
}

// Coin
export async function saveCoin(coin: Coin[]) {
  try {
    await localforage.setItem("coins", coin);
    console.log("Successfully");
  } catch (error) {
    console.error;
  }
}

export async function deleteCoin(addressToDelete: string): Promise<Coin[]> {
  const coin = (await getCoin()) as Coin[];
  const updatedCoins = coin.filter((coin) => coin.address !== addressToDelete);
  try {
    const result = await localforage.setItem("coins", updatedCoins);
    return result;
  } catch (error) {
    console.error("Error deleting coin:", error);
    return updatedCoins;
  }
}

export async function getCoin(): Promise<Coin[] | null> {
  const coin = await localforage.getItem<Coin[]>("coins");
  return coin;
}

export async function getCoinByAddress(
  address: string
): Promise<Coin | undefined> {
  const allCoin = (await getCoin()) as Coin[];
  const coin = allCoin.find((item) => item.address === address);
  return coin;
}

// Currency
export async function getCurrency(): Promise<Currency[] | null> {
  let currency = await localforage.getItem<Currency[]>("currencies");
  if (!currency) {
    currency = theCurrencies as Currency[];
    saveCurrency(theCurrencies);
  }
  return currency;
}

export async function saveCurrency(currencies: Currency[]) {
  try {
    await localforage.setItem("currencies", currencies);
    console.log("Successfully");
  } catch (error) {
    console.error;
  }
}

export async function getCurrencyByCode(
  code: string
): Promise<Currency | undefined> {
  const allCurrency = (await getCurrency()) as Currency[];
  const currency = allCurrency.find((item) => item.currency === code);
  return currency;
}

// Wallet
export async function saveCurrencyToWallet(currency: Currency) {
  try {
    const wallet = { currency: currency } as WalletInfo;
    await localforage.setItem("wallet-info", wallet);
  } catch (error) {
    console.error;
  }
}

export async function getWalletInfo(): Promise<WalletInfo | null> {
  const wallet = await localforage.getItem<WalletInfo>("wallet-info");
  return wallet;
}
