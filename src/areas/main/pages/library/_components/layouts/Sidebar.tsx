// @ts-ignore
import React, { useEffect, useState } from 'react';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import type { PGCGame } from '@shared/blockchain/icp/types/game.types';
import { getMyGames } from '@features/game/services/dto.service';
import { ImageLoading } from '@shared/constants/images';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';

export const LibrarySidebar = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { wallet } = useWallet();
  const [myApps, setMyApps] = useState<PGCGame[] | null>();

  useEffect(() => {
    async function fetchData() {
      if (!wallet) return;
      const resAllApps = await getMyGames({ wallet });
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
    <div className="flex flex-col h-full bg-card w-[250px] z-10">
      <div className="py-4 px-5  flex justify-between items-center ">
        <h1 className="text-2xl">Library</h1>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted-foreground text-xl" />
      </div>

      {/* Search  */}
      {/* <div className="px-5 py-2 mb-3">
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
      </div> */}
      {/* List Games  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1 px-5">
          {filteredGames?.map((item) => {
            const pathForItem = `/library/${formatTitle(item.name)}/${item.gameId}`;
            const isActive = location.pathname.startsWith(pathForItem);
            const href = `/library/${formatTitle(item.name)}/${item.gameId}`;
            return (
              <ButtonWithSound
                key={item.gameId}
                onClick={() => navigate(href)}
                className={`flex duration-300 relative group active:-translate-y-1 hover:cursor-pointer
              ${isActive ? 'bg-linear-to-l from-accent-foreground/40 via-accent-foreground/10' : ' '}`}
              >
                <div className="flex items-center gap-3 py-2">
                  <img
                    src={
                      item.coverVerticalImage ??
                      item.coverHorizontalImage ??
                      item.bannerImage ??
                      item.metadata?.coverVerticalImage ??
                      item.metadata?.coverHorizontalImage ??
                      ImageLoading
                    }
                    className="w-7 h-7 object-cover rounded"
                    alt={item.name}
                  />
                  <p className="truncate text-sm">{item.name}</p>
                </div>

                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3px] rounded-l-full bg-accent-foreground transition-all duration-200 ${isActive ? 'h-4/5 opacity-100' : 'h-0 opacity-0 group-hover:h-1/3 group-hover:opacity-100'} `}
                />
              </ButtonWithSound>
            );
          })}
        </div>
      </div>
    </div>
  );
};
