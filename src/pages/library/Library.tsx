// @ts-ignore
import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { AppInterface } from "../../interfaces/App";
import { getMyPurchasedApps } from "../../contexts/AppContext";

export const Library = () => {
  const { wallet } = useWallet();
  const [allGames, setAllGames] = useState<AppInterface[] | null>();

  useEffect(() => {
    async function fetchData() {
      const resAllGames = await getMyPurchasedApps(wallet);
      setAllGames(resAllGames);
    }

    fetchData();
  }, []);
  return (
    <div className="flex justify-center">
      <div className="container">
        {/* Recent  */}
        <section className="px-6 py-4 flex flex-col gap-4">
          <p className="text-xl font-medium">Recently you play</p>
          <div className="flex flex-wrap gap-8">
            <p className="text-white/50">You didn't play any game yet</p>
          </div>
        </section>

        {/* Library  */}
        <section className="px-6 py-4 flex flex-col gap-4">
          <p className="text-xl font-medium">My Games ({allGames?.length})</p>
          <div className="flex flex-wrap gap-8">
            {allGames?.map((item) => (
              <button
                key={item.id}
                className="w-[170px] bg-background_secondary rounded-xl overflow-hidden"
              >
                <img
                  src={item.cover_image}
                  alt=""
                  className="aspect-[3/4] object-cover hover:scale-110 duration-300"
                />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
