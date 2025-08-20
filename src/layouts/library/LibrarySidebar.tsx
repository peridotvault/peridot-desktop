// @ts-ignore
import React, { useEffect, useState } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, Link } from "react-router-dom";
import { useWallet } from "../../contexts/WalletContext";
import { AppInterface } from "../../interfaces/app/AppInterface";
import { getMyApps } from "../../blockchain/icp/app/services/ICPAppService";

export const Sidebar = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { wallet } = useWallet();
  const [myApps, setMyApps] = useState<AppInterface[] | null>();

  useEffect(() => {
    async function fetchData() {
      const resAllApps = await getMyApps({ wallet: wallet });
      setMyApps(resAllApps);
    }

    fetchData();
  }, []);

  // Filtered games based on searchQuery
  const filteredGames = myApps?.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {filteredGames?.map((item) => {
            const isActive =
              location.pathname ===
              `/library/${formatTitle(item.title)}/${item.appId}`;
            return (
              <Link
                key={item.appId}
                to={`/library/${formatTitle(item.title)}/${item.appId}`}
                className={`flex gap-3 px-7 py-2 items-center  duration-100
              ${
                isActive ? "shadow-flat-sm scale-110" : "hover:shadow-arise-sm "
              }`}
              >
                <img
                  src={item.coverImage}
                  className="w-6 h-6 object-cover rounded-md"
                  alt=""
                />
                <p className="truncate text-sm">{item.title}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
