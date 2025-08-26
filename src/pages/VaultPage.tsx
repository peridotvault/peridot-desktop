// @ts-ignore
import React, { useEffect, useState } from 'react';
import { VerticalCard } from '../components/cards/VerticalCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { AppInterface } from '../interfaces/app/AppInterface';
import { getAllPublishApps } from '../blockchain/icp/app/services/ICPAppService';

export default function VaultPage() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isHoverComponent, setIsHoverComponent] = useState(false);
  const [allApps, setAllApps] = useState<AppInterface[] | null>();

  const images: string[] = [
    './assets/vault/Content1.png',
    './assets/vault/Content2.png',
    './assets/vault/Content3.png',
  ];

  useEffect(() => {
    async function fetchData() {
      window.scrollTo(0, 0);

      const resAllGames = await getAllPublishApps();
      console.log(resAllGames);
      setAllApps(resAllGames);
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
            {allApps?.slice(0, 5).map((item) => (
              <VerticalCard
                key={item.appId}
                appId={BigInt(item.appId)}
                imgUrl={item.coverImage}
                title={item.title}
                price={BigInt(item.price)}
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
            {allApps?.slice(0, 5).map((item) => (
              <VerticalCard
                key={item.appId}
                appId={BigInt(item.appId)}
                imgUrl={item.coverImage}
                title={item.title}
                price={BigInt(item.price)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
