// @ts-ignore
import React, { useEffect, useState } from 'react';
import { VerticalCard } from '../components/cards/VerticalCard';
import { getPublishedGames } from '../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../blockchain/icp/vault/service.did.d';
import { optGetOr } from '../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../constants/lib.const';
import { TypographyH2 } from '../components/atoms/typography-h2';
import { categories } from './../assets/json/app/categories.json';
import { VaultCarousel } from '../components/organisms/vault-carousel';
import { VaultTopGames } from '../components/organisms/vault-top-games';

export default function VaultPage() {
  const [allGames, setAllGames] = useState<PGLMeta[] | null>();
  const welcomeGame = [
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
      gameBannerImage: './assets/vault/header.png',
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

  return (
    <main className="flex flex-col items-center gap-16">
      {/* Section 1  */}
      <VaultCarousel items={welcomeGame} />

      {/* ✅ section 3  */}
      <VaultTopGames />

      {/* ✅ section 3  */}
      <section className="flex justify-center w-full px-10">
        <div className="flex flex-col gap-6 w-full max-w-[1400px]">
          <TypographyH2 text="New on PeridotVault" />
          {/* contents  */}
          <div className="grid grid-cols-5 max-xl:grid-cols-4 gap-6">
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
      <section className="flex justify-center w-full px-10">
        <div className="flex flex-col gap-6 w-full max-w-[1400px]">
          <TypographyH2 text="Favorite Categories" />
          <div className="flex gap-6 xl:gap-12 duration-300 ">
            {categories.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className={`w-1/3 aspect-video rounded-xl bg-muted overflow-hidden duration-300 flex items-end font-bold p-6 text-xl`}
              >
                {/* <img src={image} alt="" className="w-full h-full object-cover rounded-xl" /> */}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* section 5  */}
      <section className="flex justify-center w-full px-10">
        <div className="flex flex-col gap-6 w-full max-w-[1400px]">
          <TypographyH2 text="All Games" />
          {/* contents  */}
          <div className="grid grid-cols-5 max-xl:grid-cols-4 gap-6">
            {allGames?.map((item, idx) => (
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

      <div className="mb-8"></div>
    </main>
  );
}
