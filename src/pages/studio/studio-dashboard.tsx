// @ts-ignore
import React, { useEffect, useState } from 'react';
import { PriceCoin } from '@shared/lib/constants/const-price';

export default function StudioDashboard() {
  const traffic = [
    {
      label: 'Total Revenue',
      content: 31441000000,
      isPrice: true,
    },
    {
      label: 'User Download',
      content: 61,
      isPrice: false,
    },
    {
      label: 'Developers',
      content: 3,
      isPrice: false,
    },
  ];
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-14">
        {/* Header  */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Studio Dashboard</h1>
            <p className="text-foreground/70">This information appears on PeridotVault</p>
          </div>
        </section>

        <section className="w-full grid grid-cols-3 gap-8">
          {traffic.map((item, index) => (
            <div
              key={index}
              className="border border-muted-foreground/60 bg-foreground/1 flex flex-col p-6 gap-6 rounded-lg"
            >
              <h2 className="capitalize order-2 text-foreground/70">{item.label}</h2>
              <span className="order-1 font-semibold text-2xl">
                {item.isPrice ? <PriceCoin amount={item.content} /> : <span>{item.content}</span>}
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
