import React, { useEffect, useState } from "react";
import { faChevronLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputField } from "../../../components/InputField";
import localforage from "localforage";
import { AddCoin } from "../../additional/AddCoin";
import theCoin from "./../../../assets/json/coins.json";

interface Props {
  onClose: () => void;
}

export interface Coin {
  network: string;
  address: string;
  balance: number;
  name: string;
  symbol: string;
  logo: string;
  isChecked: boolean;
}

export const Manage: React.FC<Props> = ({ onClose }) => {
  const [searchToken, setSearchToken] = useState("");
  const [listCoins, setListCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCoin, setIsAddCoin] = useState(false);
  const defaultCoins: Coin[] = theCoin;

  async function loadCoins() {
    try {
      const savedCoins = await localforage.getItem<Coin[]>("coins");

      if (savedCoins && savedCoins.length > 0) {
        // Create a merged list with both saved and default coins
        const mergedCoins = mergeCoins(defaultCoins, savedCoins);
        setListCoins(mergedCoins);
      } else {
        setListCoins(defaultCoins);
      }
    } catch (error) {
      console.error("Error loading coins:", error);
      setListCoins(defaultCoins);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCoins();
  }, []);

  const mergeCoins = (defaults: Coin[], saved: Coin[]): Coin[] => {
    // Create a map for quick lookup of saved coins
    const savedCoinsMap = new Map(saved.map((coin) => [coin.address, coin]));

    // Start with processed defaults that preserve user preferences
    const result: Coin[] = defaults.map((defaultCoin) => {
      const savedCoin = savedCoinsMap.get(defaultCoin.address);

      // If user has this coin saved, use their preference for isChecked
      if (savedCoin) {
        savedCoinsMap.delete(defaultCoin.address); // Remove from map to track processed coins
        return {
          ...defaultCoin,
          isChecked: savedCoin.isChecked,
        };
      }

      // This is a new coin the user hasn't seen before
      return defaultCoin;
    });

    // Add any remaining saved coins that aren't in defaults
    // (This would be rare but ensures we don't lose user data)
    savedCoinsMap.forEach((coin) => {
      result.push(coin);
    });

    return result;
  };

  const filteredCoins = listCoins.filter((token) =>
    token.name.toLowerCase().includes(searchToken.toLowerCase())
  );

  const handleToggle = async (index: number) => {
    try {
      // Get the current coins list
      const updatedList = [...listCoins];

      // Toggle only the isChecked field for the specific coin
      updatedList[index] = {
        ...updatedList[index],
        isChecked: !updatedList[index].isChecked,
      };

      // Update UI
      setListCoins(updatedList);

      // Save to localforage
      await localforage.setItem("coins", updatedList);
    } catch (error) {
      console.error("Error toggling coin:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 right-0 w-[370px] bg-background_primary h-full p-6 flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 w-[370px] bg-background_primary h-full p-6 flex flex-col gap-4">
      {/* header  */}
      <section className="flex justify-between items-center">
        <button
          onClick={onClose}
          className=" w-10 h-10 flex justify-center items-center rounded-xl"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
        </button>
        <p className="text-lg font-semibold">Manage</p>
        <div className="w-10 h-10"></div>
      </section>

      <section className="flex gap-4">
        <InputField
          onChange={(e) => setSearchToken(e)}
          placeholder="Enter Token Name"
          type="text"
          text={searchToken}
        />

        <button
          onClick={() => setIsAddCoin(true)}
          className="bg-background_secondary aspect-square flex h-full justify-center items-center text-xl rounded-xl shadow-arise-sm hover:shadow-flat-sm duration-300 hover:scale-105"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </section>

      {/* Token Lists  */}
      <section className="flex flex-col gap-5 pt-2">
        {filteredCoins.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
                {item?.logo != null ? (
                  <img
                    src={item?.logo != null ? item?.logo : "null"}
                    alt=""
                    className={`w-full ${
                      item?.address == "ryjl3-tyaaa-aaaaa-aaaba-cai"
                        ? "p-3"
                        : ""
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-background_disabled animate-pulse"></div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex gap-1 items-center">
                  {item?.symbol != null ? (
                    <p>{item?.symbol}</p>
                  ) : (
                    <div className="w-7 h-5 bg-background_disabled rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-xs">
                  {item?.name != null ? (
                    <p>{item?.name}</p>
                  ) : (
                    <div className="w-7 h-3 bg-background_disabled rounded-full animate-pulse mt-1"></div>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <label className="relative inline-block w-[3.4em] h-[1.5em]">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  checked={item.isChecked}
                  onChange={() => handleToggle(index)}
                />
                <span
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-background_primary shadow-arise-sm transition-all duration-500 rounded-lg ${
                    item.isChecked ? "bg-white shadow-lg" : ""
                  }`}
                ></span>
                <span
                  className={`absolute content-[''] h-[.9em] w-[0.1em] rounded-none left-[0.5em] bottom-[0.3em] bg-white transition-transform duration-500 ${
                    item.isChecked
                      ? " bg-black translate-x-[2.4em] rotate-180"
                      : ""
                  }`}
                ></span>
              </label>
            </div>
          </div>
        ))}
      </section>

      {/* Add New Coin  */}
      {isAddCoin ? (
        <AddCoin
          onClose={() => {
            loadCoins();
            setIsAddCoin(false);
          }}
        />
      ) : (
        ""
      )}
    </div>
  );
};
