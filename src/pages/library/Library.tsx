import React from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { Link } from 'react-router-dom';
import { getMyGames } from '../../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../../blockchain/icp/vault/service.did.d';
import { optGetOr } from '../../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../../constants/lib.const';

export default function LibraryPage() {
  const { wallet } = useWallet();
  const [myGames, setMyGames] = React.useState<PGLMeta[] | null>();

  React.useEffect(() => {
    async function fetchData() {
      const resAllGames = await getMyGames({ wallet: wallet });
      console.log('RESS :', resAllGames);
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
                to={`/library/${formatTitle(item.pgl1_name)}/${item.pgl1_game_id}`}
                key={item.pgl1_game_id}
                className="w-[170px] aspect-3/4 bg-card rounded-xl overflow-hidden"
              >
                <img
                  src={optGetOr(item.pgl1_cover_image, ImageLoading)}
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
