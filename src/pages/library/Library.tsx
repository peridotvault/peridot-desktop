// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { AppInterface } from '../../interfaces/app/AppInterface';
import { Link } from 'react-router-dom';
import { getMyApps } from '../../blockchain/icp/app/services/ICPAppService';

export const Library = () => {
  const { wallet } = useWallet();
  const [myApps, setMyApps] = useState<AppInterface[] | null>();

  useEffect(() => {
    async function fetchData() {
      const resAllApps = await getMyApps({ wallet: wallet });
      setMyApps(resAllApps);
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
            <p className="text-white/50">You didn't play any game yet</p>
          </div>
        </section>

        {/* Library  */}
        <section className="px-6 py-4 flex flex-col gap-4">
          <p className="text-xl font-medium">My Games ({myApps?.length})</p>
          <div className="flex flex-wrap gap-8">
            {myApps?.map((item) => (
              <Link
                to={`/library/${formatTitle(item.title)}/${item.appId}`}
                key={item.appId}
                className="w-[170px] aspect-[3/4] bg-background_secondary rounded-xl overflow-hidden"
              >
                <img
                  src={item.coverImage}
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
};
