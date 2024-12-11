import { list } from "postcss";
import React, { useState } from "react";

export const Library = () => {
  const [listgame, setListGame] = useState([
    {
      title: "Infinity",
      cover: "./img/games/Cover.jpg",
      cover2: "./img/games/Gameplay2.JPG",
    },
  ]);
  return (
    <main className="pt-20 flex h-dvh ">
      {/* Sidebar  */}
      <div className="flex flex-col px-3 shadow-flat-lg">
        <div className="mt-3"></div>
        {/* Search  */}
        <div className="p-2">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">
              <input className="size-5 text-textDisable" />
            </div>
            <input
              type="search"
              className="block w-full p-2 ps-8 text-sm border border-textDisable rounded-r-md bg-transparent pb-1 "
              placeholder="Search The Game..."
            />
          </div>
        </div>
        {/* List Games  */}
        <div
          className="mt-1 flex flex-col overflow-y-auto"
          style={{ height: `calc(100vh - 4rem - 3.2rem - 5rem)` }}
        >
          {listgame.map(function (item, i) {
            return (
              <div
                className="flex gap-2 px-4 py-2 items-center hover:bg-myaccentDarkColor rounded-r-md"
                key={i}
              >
                <img
                  src={item.cover}
                  className="w-7 h-7 object-cover rounded-md"
                  alt=""
                />
                <p className="mt-1 truncate text-sm">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
