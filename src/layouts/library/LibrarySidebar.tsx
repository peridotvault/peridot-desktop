// @ts-ignore
import React, { useEffect, useState } from 'react';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, Link } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { getMyGames } from '../../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../../blockchain/icp/vault/service.did.d';
import { ImageLoading } from '../../constants/lib.const';
import { optGetOr } from '../../interfaces/helpers/icp.helpers';

export const Sidebar = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { wallet } = useWallet();
  const [myApps, setMyApps] = useState<PGLMeta[] | null>();

  useEffect(() => {
    async function fetchData() {
      const resAllApps = await getMyGames({ wallet: wallet });
      setMyApps(resAllApps);
    }

    fetchData();
  }, []);

  // Filtered games based on searchQuery
  const filteredGames = myApps?.filter((game) =>
    game.pgl1_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatTitle = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <div className="flex flex-col h-full shadow-arise-sm w-[230px] z-10">
      <div className="mt-3"></div>
      {/* Search  */}
      <div className="px-5 py-2 mb-3">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-text_disabled" />
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
              location.pathname === `/library/${formatTitle(item.pgl1_name)}/${item.pgl1_game_id}`;
            return (
              <Link
                key={item.pgl1_game_id}
                to={`/library/${formatTitle(item.pgl1_name)}/${item.pgl1_game_id}`}
                className={`flex gap-3 px-7 py-2 items-center  duration-100
              ${isActive ? 'shadow-flat-sm scale-110' : 'hover:shadow-arise-sm '}`}
              >
                <img
                  src={optGetOr(item.pgl1_cover_image, ImageLoading)}
                  className="w-6 h-6 object-cover rounded-md"
                  alt=""
                />
                <p className="truncate text-sm">{item.pgl1_name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
