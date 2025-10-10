// @ts-ignore
import React, { useEffect, useState } from 'react';
import { VerticalCard } from '../components/cards/VerticalCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faTrophy } from '@fortawesome/free-solid-svg-icons';
import AIChat from '../components/ai/AIChat';
import { getPublishedGames } from '../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../blockchain/icp/vault/service.did.d';
import { optGetOr } from '../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../constants/lib.const';
import { TypographyH1 } from '../components/atoms/typography-h1';
import { GameHorizontal } from '../components/molecules/game-horizontal';
import Input from '@mui/material/Input';
import { InputField } from '../components/atoms/InputField';
import { TypographyH2 } from '../components/atoms/typography-h2';
import { categories } from './../assets/json/app/categories.json';

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
      {/* Section 1  */}
      <section className="flex justify-center px-12 py-6 ">
        <div className="w-full max-w-[1200px] flex flex-col gap-8">
          <div className="flex w-full gap-8">
            <div className="w-full text-start">
              <TypographyH1 text="Game Vault" />
            </div>
            <div className="max-w-80 w-full flex flex-col gap-4">
              <InputField type="text" placeholder="Search Game" onChange={() => {}} value="" />
            </div>
          </div>

          <div className="flex w-full max-lg:flex-col gap-8">
            <div className="w-full duration-300">
              <div className="bg-background_disabled w-full aspect-video rounded-xl duration-300 overflow-hidden">
                <img src={images[1]} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="lg:max-w-80 w-full flex flex-col gap-4 max-lg:pb-8 duration-300">
              {/* Top Games This Month  */}
              <div className="flex gap-2 font-bold items-center">
                <FontAwesomeIcon icon={faTrophy} className="text-xl" />
                <TypographyH2 text="Top Games This Month" />
              </div>

              <div className="grid max-lg:grid-cols-3 gap-2 w-full">
                {allGames?.slice(0, 3).map((item, idx) => (
                  <GameHorizontal
                    key={idx}
                    gameId={item.pgl1_game_id}
                    gameName={item.pgl1_name}
                    imgUrl={optGetOr(item.pgl1_cover_image, ImageLoading)}
                    price={Number(item.pgl1_price)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AIChat />

      {/* section 3  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6 w-full max-w-[1200px]">
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
        <div className="flex flex-col gap-6 w-full max-w-[1200px]">
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
