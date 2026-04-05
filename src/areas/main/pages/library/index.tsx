import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LibraryGameCard } from '@main/features/library/components/GameCard';
import { useMyGames, RealLibraryGame } from '@main/features/library/hooks/useMyGames';
import { formatTitle } from '@main/features/library/utils/formatTitle';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { games, loading, error, isEmpty } = useMyGames();

  const recentGames = useMemo(() => {
    return games
      .filter((g) => g.localEntry?.stats?.lastLaunchedAt)
      .sort((a, b) => (b.localEntry?.stats?.lastLaunchedAt ?? 0) - (a.localEntry?.stats?.lastLaunchedAt ?? 0))
      .slice(0, 8);
  }, [games]);

  const allGames = useMemo(() => {
    // Sort logic: Installed first, then by name or createdAt
    return [...games].sort((a, b) => {
      if (a.status === 'installed' && b.status !== 'installed') return -1;
      if (a.status !== 'installed' && b.status === 'installed') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [games]);

  if (isEmpty && !loading) {
    return (
      <div className="w-full h-[80vh] flex flex-col justify-center items-center gap-4 text-foreground/50">
        <p className="text-xl font-medium">Your Library is Empty</p>
        <p className="text-sm">Explore the store to add some games!</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen pb-20">
      <div className="container max-w-7xl px-6 py-8 flex flex-col gap-12">
        
        {/* Header  */}
        <header className="flex flex-col gap-2">
           <h1 className="text-4xl font-bold tracking-tight">My Games</h1>
           {error && <p className="text-red-400 text-sm">{error}</p>}
        </header>

        {/* Recently Played  */}
        {recentGames.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold opacity-90">Recently Played</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {recentGames.map((game) => (
                <GameItem key={game.gameId} game={game} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* All Games  */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold opacity-90">
            {recentGames.length > 0 ? 'All Games' : 'Library'} 
            {!loading && ` (${allGames.length})`}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  <div className="aspect-[2/3] bg-foreground/10 rounded-xl" />
                  <div className="h-4 bg-foreground/10 rounded w-3/4" />
                </div>
              ))
            ) : (
              allGames.map((game) => (
                <GameItem key={game.gameId} game={game} navigate={navigate} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function GameItem({ game, navigate }: { game: RealLibraryGame; navigate: any }) {
  const slug = formatTitle(game.name);
  const pathForItem = `/library/${slug}/${game.gameId}`;

  return (
    <div className="flex flex-col gap-3 group transition-transform duration-300 hover:scale-[1.02]">
      <LibraryGameCard
        entry={{
          gameId: game.gameId,
          gameName: game.name,
          coverVerticalImage: game.coverVerticalImage,
          bannerImage: game.bannerImage,
        }}
        onClick={() => navigate(pathForItem)}
      />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-sm truncate opacity-90 group-hover:opacity-100 transition-opacity">
          {game.name}
        </p>
        <span className="text-[10px] uppercase tracking-wider opacity-40 font-bold truncate">
           {game.status === 'owned' ? 'Not Installed' : game.status}
        </span>
      </div>
    </div>
  );
}
