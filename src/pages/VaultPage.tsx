// @ts-ignore
import React, { useEffect, useState } from 'react';
import { VerticalCard } from '../components/cards/VerticalCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import AIChat from '../components/ai/AIChat';
import { getPublishedGames } from '../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../blockchain/icp/vault/service.did.d';
import { optGetOr } from '../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../constants/lib.const';

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
      {/* AI Chat */}
      <AIChat />

      {/* section 1  */}
      <section className="w-full h-[30rem] pt-20 mb-4 relative">
        <img src="https://i.imgur.com/ZlbIhY2.gif" alt="" className="w-full h-full object-cover" />
        <div className="w-full h-16 absolute bottom-0 bg-gradient-to-t from-background_primary"></div>
      </section>

      {/* section 2  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex gap-6 xl:gap-12 duration-300 w-full container">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-1/3 aspect-video rounded-xl bg-background_primary overflow-hidden duration-300 flex items-center justify-center 
          ${activeIndex === index ? 'scale-105 opacity-100 shadow-flat' : 'scale-100 opacity-70'}
        `}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave()}
            >
              <img src={image} alt="" className="w-full h-full object-cover rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      {/* section 3  */}
      <section className="flex justify-center px-12 py-6">
        <div className="flex flex-col gap-6 w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">Black Friday - Cyber Monday Spotlight</p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

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
        <div className="flex flex-col gap-6  w-full container">
          {/* title  */}
          <button className="flex items-center gap-3">
            <p className="text-xl font-semibold">Black Friday - Cyber Monday Spotlight</p>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>

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
    </main>
  );
}
