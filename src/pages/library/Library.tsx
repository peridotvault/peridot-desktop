// @ts-ignore
import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { AppInterface } from "../../interfaces/app/AppInterface";
import { Link } from "react-router-dom";
import { getMyApps } from "../../blockchain/icp/app/services/ICPAppService";

export const Library = () => {
  const { wallet } = useWallet();
  const [_, setAllGames] = useState<AppInterface[] | null>();

  useEffect(() => {
    async function fetchData() {
      const resAllGames = await getMyApps({ wallet: wallet });
      setAllGames(resAllGames);
    }

    fetchData();
  }, []);

  const dummyGameList = [
    {
      id: 1,
      cover_image: "https://storage.googleapis.com/pod_public/750/216712.jpg",
      title: "Elden Ring",
      price: 59.99,
    },
    {
      id: 3,
      cover_image:
        "https://m.media-amazon.com/images/M/MV5BZWYyNDRkNzAtOTI0Ny00NDQwLWE5M2YtMWFiZDdmMDc4MmQ0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      title: "Cyberpunk 2077",
      price: 49.99,
    },
    {
      id: 4,
      cover_image: "https://m.media-amazon.com/images/I/61Nm7jqUUSL.jpg",
      title: "Hogwarts Legacy",
      price: 59.99,
    },
    {
      id: 6,
      cover_image:
        "https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg",
      title: "The Witcher 3: Wild Hunt",
      price: 29.99,
    },
    {
      id: 7,
      cover_image:
        "https://media.rockstargames.com/rockstargames/img/global/news/upload/actual_1364906194.jpg",
      title: "Grand Theft Auto V",
      price: 19.99,
    },
    {
      id: 10,
      cover_image:
        "https://image.api.playstation.com/vulcan/ap/rnd/202009/3021/BtsjAgHT9pqHRXtN9FCk7xc8.png",
      title: "Spider-Man Remastered",
      price: 59.99,
    },
    {
      id: 11,
      cover_image:
        "https://img.gamepix.com/games/cubetopia-parkour/icon/cubetopia-parkour.png?w=400",
      title: "Cubetopia",
      price: 0,
    },
  ];

  const formatTitle = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, "_");
  };

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
          <p className="text-xl font-medium">
            My Games ({dummyGameList?.length})
          </p>
          <div className="flex flex-wrap gap-8">
            {dummyGameList?.map((item) => (
              <Link
                to={`/library/${formatTitle(item.title)}`}
                key={item.id}
                className="w-[170px] aspect-[3/4] bg-background_secondary rounded-xl overflow-hidden"
              >
                <img
                  src={item.cover_image}
                  alt=""
                  className="w-full h-full object-cover hover:scale-110 duration-300"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
