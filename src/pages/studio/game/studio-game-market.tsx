import React from 'react';
import { ButtonWithSound } from '../../../components/atoms/button-with-sound';

export const StudioGameMarket = () => {
  const HeaderContainer = ({ title, description }: { title: string; description: string }) => {
    return (
      <div>
        <h2 className="text-2xl mb-2">{title}</h2>
        <p className="text-foreground/70">{description}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-14">
        {/* Header  */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Market</h1>
            <p className="text-foreground/70">This information appears on PeridotVault</p>
          </div>
          <ButtonWithSound className="bg-card-foreground text-card font-bold py-2 px-6 rounded-md">
            <span>Save to Draft</span>
          </ButtonWithSound>
        </section>

        {/* Previews Upload  */}
        <section className="grid gap-8">
          <HeaderContainer
            title="List Items"
            description="List Item address for your game on PeridotVault"
          />
        </section>
      </div>
      <p className="bg-accent w-full text-center text-2xl p-4 font-bold">Coming Soon</p>
    </div>
  );
};
