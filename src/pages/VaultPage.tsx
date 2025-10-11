// @ts-ignore
import React, { useEffect, useState } from 'react';
import { VerticalCard } from '../components/cards/VerticalCard';
import AIChat from '../components/ai/AIChat';
import { getPublishedGames } from '../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../blockchain/icp/vault/service.did.d';
import { optGetOr } from '../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../constants/lib.const';
import { TypographyH2 } from '../components/atoms/typography-h2';
import { categories } from './../assets/json/app/categories.json';
import { PriceCoin } from '../lib/constants/const-price';
import { CarouselVault } from '../components/organisms/carousel-vault';

export default function VaultPage() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isHoverComponent, setIsHoverComponent] = useState(false);
  const [allGames, setAllGames] = useState<PGLMeta[] | null>();

  const images: string[] = [
    './assets/vault/Content1.png',
    './assets/vault/Content2.png',
    './assets/vault/Content3.png',
  ];

  const gameExample = [
    {
      gameId: 'SADC1',
      gameBannerImage: './assets/vault/Content1.png',
      gameName: 'Peridot Game',
      gameDescription:
        'Welcome to Shatterline - ground zero for the apocalypse. Are you ready? Shatterline is a fierce, intense multiplayer FPS, offering roguelike co-op PVE modes as well as competitive PvP modes.',
      gamePrice: 0,
    },
    {
      gameId: 'SADC2',
      gameBannerImage: './assets/vault/Content2.png',
      gameName: 'Cyberpunk',
      gameDescription:
        'Welcome to Shatterline - ground zero for the apocalypse. Are you ready? Shatterline is a fierce, intense multiplayer FPS, offering roguelike co-op PVE modes as well as competitive PvP modes.',
      gamePrice: 10000000000,
    },
    {
      gameId: 'SADC3',
      gameBannerImage: './assets/vault/Content3.png',
      gameName: 'Stray',
      gameDescription:
        'Welcome to Shatterline - ground zero for the apocalypse. Are you ready? Shatterline is a fierce, intense multiplayer FPS, offering roguelike co-op PVE modes as well as competitive PvP modes.',
      gamePrice: 200000000000,
    },
  ];

  useEffect(() => {
    async function fetchData() {
      window.scrollTo(0, 0);

      const resAllGames = await getPublishedGames({ start: 0, limit: 200 });
      console.log(resAllGames);
      setAllGames(resAllGames);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!isHoverComponent) {
      const id = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
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
      {/* Section 1  */}
      <CarouselVault items={gameExample} />

      <AIChat />

      {/* section 3  */}
      <section className="flex justify-center py-6">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-full px-12 flex justify-center">
            <div className="max-w-[1400px] w-full">
              <TypographyH2 text="Top Games This Month" />
            </div>
          </div>
          {/* contents  */}
          <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex gap-2 w-max">
                {Array.from({ length: 10 }).map((item, idx) => (
                  <div className="w-72 h-80 relative flex justify-end">
                    <span className="text-[12rem] font-bold absolute left-2 bottom-16">
                      {idx + 1}
                    </span>
                    <div className="h-80 w-60 bg-background_disabled rounded-lg">
                      <img src="" alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* section 3  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6 w-full max-w-[1400px]">
          <TypographyH2 text="New on PeridotVault" />
          {/* contents  */}
          <div className="flex gap-6">
            {allGames?.slice(0, 5).map((item, idx) => (
              <VerticalCard
                key={idx}
                gameId={item.pgl1_game_id}
                gameName={item.pgl1_name}
                imgUrl={optGetOr(item.pgl1_cover_image, ImageLoading)}
                price={Number(item.pgl1_price)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* section 4  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6 w-full max-w-[1400px]">
          <TypographyH2 text="Favorite Categories" />
          <div className="flex gap-6 xl:gap-12 duration-300 ">
            {categories.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                className={`w-1/3 aspect-video rounded-xl bg-background_disabled overflow-hidden duration-300 flex items-end font-bold p-6 text-xl 
              ${activeIndex === idx ? 'scale-105 opacity-100 shadow-flat' : 'scale-100 opacity-70'}
              `}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={() => handleMouseLeave()}
              >
                {/* <img src={image} alt="" className="w-full h-full object-cover rounded-xl" /> */}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-8"></div>
    </main>
  );
}
