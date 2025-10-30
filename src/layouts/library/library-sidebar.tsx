// @ts-ignore
import React, { useEffect, useState } from 'react';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, Link } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import { OffChainGameMetadata } from '@features/game/types/game.type';
import { getPublishedGames } from '@features/game/services/dto.service';
import { ImageLoading } from '../../constants/lib.const';

export const LibrarySidebar = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { wallet } = useWallet();
  const [myApps, setMyApps] = useState<OffChainGameMetadata[] | null>();

  useEffect(() => {
    async function fetchData() {
      if (!wallet) return;
      const resAllApps = await getPublishedGames({ start: 0, limit: 200 });
      setMyApps(resAllApps);
    }

    fetchData();
  }, [wallet]);

  // Filtered games based on searchQuery
  const filteredGames = myApps?.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted-foreground" />
          </div>
          <input
            type="search"
            className="block w-full p-2 ps-10 text-sm border border-muted-foreground rounded-lg bg-transparent outline-none"
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
            const pathForItem = `/library/${formatTitle(item.name)}/${item.game_id}`;
            const isActive = location.pathname.startsWith(pathForItem);
            return (
              <Link
                key={item.game_id}
                to={`/library/${formatTitle(item.name)}/${item.game_id}`}
                className={`flex gap-3 px-7 py-2 items-center  duration-100
              ${isActive ? 'shadow-flat-sm scale-110' : 'hover:shadow-arise-sm '}`}
              >
                <img
                  src={item.metadata?.cover_vertical_image ?? ImageLoading}
                  className="w-6 h-6 object-cover rounded-md"
                  alt={item.name}
                />
                <p className="truncate text-sm">{item.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
