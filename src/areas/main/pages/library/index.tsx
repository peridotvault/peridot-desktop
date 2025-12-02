import React from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { Link } from 'react-router-dom';
import type { PGCGame } from '@shared/blockchain/icp/types/game.types';
import { getMyGames } from '@shared/blockchain/icp/services/game';
import { ImageLoading } from '@shared/constants/images';

export default function LibraryPage() {
  const { wallet } = useWallet();
  const [myGames, setMyGames] = React.useState<PGCGame[] | null>();

  React.useEffect(() => {
    async function fetchData() {
      const resAllGames = await getMyGames({ wallet: wallet });
      setMyGames(resAllGames);
    }

    fetchData();
  }, []);

  const formatTitle = (title: string): string => {
    return title.toLowerCase().replace(/\s+/g, '_');
  };

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
          <p className="text-xl font-medium">My Games ({myGames?.length})</p>
          <div className="flex flex-wrap gap-8">
            {myGames?.map((item) => (
              <Link
                to={`/library/${formatTitle(item.name)}/${item.gameId}`}
                key={item.gameId}
                className="w-[170px] aspect-3/4 bg-card rounded-xl overflow-hidden"
              >
                <img
                  src={
                    item.coverVerticalImage ??
                    item.coverHorizontalImage ??
                    item.bannerImage ??
                    item.metadata?.coverVerticalImage ??
                    item.metadata?.coverHorizontalImage ??
                    ImageLoading
                  }
                  alt=""
                  className="w-full h-full object-cover hover:scale-110 duration-300"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
