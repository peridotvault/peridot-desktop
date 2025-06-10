// @ts-ignore
import React, { useEffect, useState } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyPurchasedApps } from "../../../contexts/AppContext";
import { AppInterface } from "../../../interfaces/App";
import { useWallet } from "../../../contexts/WalletContext";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { wallet } = useWallet();
  const [allGames, setAllGames] = useState<AppInterface[] | null>();

  useEffect(() => {
    async function fetchData() {
      const resAllGames = await getMyPurchasedApps(wallet);
      setAllGames(resAllGames);
    }

    fetchData();
  }, []);
  // Filtered games based on searchQuery
  const filteredGames = allGames?.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGameClick = (path: string) => {
    navigate(path);
  };

  const formatTitle = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, "_");
  };

  return (
    <div className="flex flex-col h-full shadow-arise-sm w-[230px] z-10">
      <div className="mt-3"></div>
      {/* Search  */}
      <div className="px-5 py-2 mb-3">
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1">
          {filteredGames?.map((item, i) => {
            const isActive =
              location.pathname === `/library/${formatTitle(item.title)}`;
            return (
              <button
                key={i}
                onClick={() => handleGameClick(formatTitle(item.title))}
                className={`flex gap-3 px-7 py-2 items-center  duration-100
              ${
                isActive ? "shadow-flat-sm scale-110" : "hover:shadow-arise-sm "
              }`}
              >
                <img
                  src={item.cover_image}
                  className="w-6 h-6 object-cover rounded-md"
                  alt=""
                />
                <p className="truncate text-sm">{item.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
