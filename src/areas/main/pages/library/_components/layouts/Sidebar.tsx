// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import { LibrarySidebarItem } from '@main/features/library/components/SidebarItem';
import { useLibraryStore } from '@main/features/library/hooks/useLibraryStore';
import { syncLibraryFromRemote } from '@main/features/library/services/sync';
import { formatTitle } from '@main/features/library/utils/formatTitle';

export const LibrarySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet } = useWallet();

  const { entries, isLoading, loadAll } = useLibraryStore();
  const [searchQuery] = useState('');

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
