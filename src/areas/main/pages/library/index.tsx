import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTitle } from '@features/library/utils/formatTitle';
import { useLibraryStore } from '@features/library/hooks/useLibraryStore';
import { LibraryEntry } from '@shared/interfaces/library';
import { LibraryGameCard } from '@features/library/components/GameCard';

export default function LibraryPage() {
  const navigate = useNavigate();

  const { entries, isLoading, error, loadAll } = useLibraryStore();
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const recentGames: LibraryEntry[] = useMemo(() => {
    return entries
      .filter((e) => e.stats.lastLaunchedAt) // hanya yang pernah dimainkan
      .sort((a, b) => (b.stats.lastLaunchedAt ?? 0) - (a.stats.lastLaunchedAt ?? 0))
      .slice(0, 8);
  }, [entries]);

  const allGames: LibraryEntry[] = useMemo(() => {
    return [...entries].sort((a, b) => b.createdAt - a.createdAt);
  }, [entries]);

  return (
    <div className="flex justify-center">
      <div className="container">
        {/* Recent  */}
        <section className="px-6 py-4 flex flex-col gap-4">
          <p className="text-xl font-medium">Recently you play</p>
          <div className="flex flex-wrap gap-8">
            <p className="text-foreground/50">You didn't play any game yet</p>
          </div>
        </section>

        {/* Library  */}
        <section className="px-6 py-4 flex flex-col gap-4">
          <p className="text-xl font-medium">My Games ({allGames?.length})</p>
          <div className="flex flex-wrap gap-8">
            {allGames?.map((entry) => {
              const slug = formatTitle(entry.gameName);
              const pathForItem = `/library/${slug}/${entry.gameId}`;
              return (
                <LibraryGameCard
                  key={entry.gameId}
                  entry={entry}
                  onClick={() => navigate(pathForItem)}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
