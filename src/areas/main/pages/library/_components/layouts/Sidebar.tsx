// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import { formatTitle } from '@features/library/utils/formatTitle';
import { useLibraryStore } from '@features/library/hooks/useLibraryStore';
import { LibrarySidebarItem } from '@features/library/components/SidebarItem';
import { syncLibraryFromRemote } from '@features/library/services/sync';

export const LibrarySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet } = useWallet();

  const { entries, isLoading, error, loadAll } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!wallet) return;

    (async () => {
      await syncLibraryFromRemote(wallet);
      await loadAll();
    })();
  }, [wallet, loadAll]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => entry.gameName.toLowerCase().includes(q));
  }, [entries, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-card w-[250px] z-10">
      <div className="py-4 px-5  flex justify-between items-center ">
        <h1 className="text-2xl">Library</h1>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted-foreground text-xl" />
      </div>

      {!isLoading && !filteredEntries.length && (
        <p className="text-xs text-muted-foreground px-5 py-2">No games in your library yet.</p>
      )}

      {/* List Games  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1 px-5">
          {filteredEntries.map((entry) => {
            const slug = formatTitle(entry.gameName);
            const pathForItem = `/library/${slug}/${entry.gameId}`;
            const isActive = location.pathname.startsWith(pathForItem);

            return (
              <LibrarySidebarItem
                key={entry.gameId}
                entry={entry}
                isActive={isActive}
                onClick={() => navigate(pathForItem)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
