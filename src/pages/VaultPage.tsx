// @ts-ignore
import React, { useEffect, useState } from "react";
import { VerticalCard } from "../components/cards/VerticalCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { getAllApps } from "../contexts/AppContext";
import { AppInterface } from "../interfaces/App";

export default function VaultPage() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isHoverComponent, setIsHoverComponent] = useState(false);
  const [allGames, setAllGames] = useState<AppInterface[] | null>();

  const dummyGameList = [
    {
      id: 1,
      cover_image: "https://storage.googleapis.com/pod_public/750/216712.jpg",
      title: "Elden Ring",
      price: 59.99,
    },
    {
      id: 2,
      cover_image:
        "https://upload.wikimedia.org/wikipedia/id/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg",
      title: "God of War Ragnarok",
      price: 69.99,
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
      id: 5,
      cover_image:
        "https://smartcdkeys.com/image/cache/catalog/image/cache/data/products/resident-evil-4-remake/cover/resident-evil-4-remake-smartcdkeys-cheap-cd-key-cover-390x580.webp",
      title: "Resident Evil 4 Remake",
      price: 39.99,
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
      id: 8,
      cover_image:
        "https://cdn1.epicgames.com/400347196e674de89c23cc2a7f2121db/offer/AC%20KINGDOM%20PREORDER_STANDARD%20EDITION_EPIC_Key_Art_Portrait_640x854-640x854-288120c5573756cb988b6c1968cebd86.png",
      title: "Assassin's Creed Valhalla",
      price: 39.99,
    },
    {
      id: 9,
      cover_image:
        "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg",
      title: "Red Dead Redemption 2",
      price: 49.99,
    },
    {
      id: 10,
      cover_image:
        "https://image.api.playstation.com/vulcan/ap/rnd/202009/3021/BtsjAgHT9pqHRXtN9FCk7xc8.png",
      title: "Spider-Man Remastered",
      price: 59.99,
    },
  ];

  const images: string[] = [
    "./assets/vault/Content1.png",
    "./assets/vault/Content2.png",
    "./assets/vault/Content3.png",
  ];

  useEffect(() => {
    async function fetchData() {
      const resAllGames = await getAllApps();
      setAllGames(resAllGames);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!isHoverComponent) {
      const id = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [isHoverComponent, images.length]);

  const handleMouseEnter = (index: number) => {
    setIsHoverComponent(true);
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setIsHoverComponent(false);
  };

  return (
    <main className="flex flex-col gap-3">
      {/* section 1  */}
      <section className="w-full h-[30rem] pt-20 mb-4 relative">
        <img
          src="https://i.imgur.com/ZlbIhY2.gif"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="w-full h-16 absolute bottom-0 bg-gradient-to-t from-background_primary"></div>
      </section>

      {/* section 2  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex gap-6 xl:gap-12 duration-300 w-full container">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-1/3 aspect-video rounded-xl bg-background_primary overflow-hidden duration-300 flex items-center justify-center 
          ${
            activeIndex === index
              ? "scale-105 opacity-100 shadow-flat"
              : "scale-100 opacity-70"
          }
        `}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave()}
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      </section>

      {/* section 3  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6 w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">
              Black Friday - Cyber Monday Spotlight
            </p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

          {/* contents  */}
          <div className="flex gap-6">
            {dummyGameList?.slice(0, 5).map((item) => (
              <VerticalCard
                key={item.id}
                id={item.id}
                imgUrl={item.cover_image}
                title={item.title}
                price={item.price}
              />
            ))}
          </div>
        </div>
      </section>

      {/* section 4  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6  w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">
              Black Friday - Cyber Monday Spotlight
            </p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

          {/* contents  */}
          <div className="flex gap-6">
            {dummyGameList?.slice(5, 10).map((item) => (
              <VerticalCard
                key={item.id}
                id={item.id}
                imgUrl={item.cover_image}
                title={item.title}
                price={item.price}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
