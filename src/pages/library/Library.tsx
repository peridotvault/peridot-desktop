// @ts-ignore
import React, { useState } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listgame] = useState([
    {
      title: "Assassin Creed",
      cover: "/assets/logo-peridot.svg",
    },
    {
      title: "Infinity",
      cover: "/assets/logo-peridot.svg",
    },
    {
      title: "The Runners",
      cover: "/assets/logo-peridot.svg",
    },
  ]);
  // Filtered games based on searchQuery
  const filteredGames = listgame.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="pt-20 flex h-dvh ">
      {/* Sidebar  */}
      <div className="flex flex-col px-3 shadow-flat-lg w-[250px]">
        <div className="mt-3"></div>
        {/* Search  */}
        <div className="p-2">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-text_disabled"
              />
            </div>
            <input
              type="search"
              className="block w-full p-2 ps-10 text-sm border border-text_disabled rounded-lg bg-transparent outline-none"
              placeholder="Search The Game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {/* List Games  */}
        <div className="mt-1 flex flex-col overflow-y-auto">
          {filteredGames.map((item, i) => {
            return (
              <button
                className="flex gap-2 px-4 py-2 items-center hover:bg-myaccentDarkColor rounded-r-md hover:bg-gradient-to-l hover:from-accent_primary/10 hover:border-r border-accent_primary"
                key={i}
              >
                <img
                  src={item.cover}
                  className="w-7 h-7 object-cover rounded-md"
                  alt=""
                />
                <p className="mt-1 truncate text-sm">{item.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contain  */}
      <div className="">
        <p>Content</p>
      </div>
    </main>
  );
}
