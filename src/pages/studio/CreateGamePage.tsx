// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/molecules/Alert';
import { getGameByDeveloperId } from '../../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../../blockchain/icp/vault/service.did.d';
import { optGetOr } from '../../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../../constants/lib.const';
import { NewGame } from '../../components/organisms/NewGame';
import { getGameUnRegistered } from '../../blockchain/icp/factory/services/ICPFactoryService';
import { Principal } from '@dfinity/principal';

export const CreateGamePage = () => {
  const { wallet } = useWallet();

  const [games, setGames] = useState<PGLMeta[] | null>(null);
  const [gameRecords, setGameRecords] = useState<
    {
      name: string;
      canister_id: Principal;
      game_id: string;
      registered: boolean;
    }[]
  >([
    {
      name: '',
      canister_id: Principal.fromText('aaaaa-aa'),
      game_id: '',
      registered: false,
    },
  ]);
  const [isCreateGameModal, setIsCreateGameModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return; // jaga2 kalau wallet belum siap
        const listGame = await getGameByDeveloperId({
          dev: wallet.principalId!,
          start: 0,
          limit: 200,
        });
        const listUnRegistered = await getGameUnRegistered({
          wallet: wallet,
        });
        if (isMounted) {
          setGameRecords(listUnRegistered);
          setGames(listGame);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [wallet]);

  return (
    <div className="flex flex-col w-full max-w-[1400px] p-8">
      {/* header   */}
      <section className="text-4xl flex flex-col gap-4 ">
        <div className="flex items-center gap-4">
          <h1 className="font-bold">Games</h1>
          <button
            onClick={() => setIsCreateGameModal(true)}
            className={
              'flex aspect-square text-lg bg-accent_secondary rounded-full w-8 h-8 items-center justify-center duration-300 hover:shadow-flat-sm'
            }
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <hr className="border-white/20" />
      </section>

      {/* List Games   */}
      <section className="mt-8">
        {games && games?.length > 0 ? (
          games.map((item, index) => (
            <Link
              key={index}
              className="border-b border-text_disabled/25 px-8 py-4 hover:bg-background_secondary flex gap-6 items-center justify-between"
              to={'/studio/update/' + item.pgl1_game_id.toString()}
            >
              <div className="flex gap-6 items-start">
                <div className="w-12 aspect-[3/4]">
                  <img
                    src={optGetOr(item.pgl1_cover_image, ImageLoading)}
                    alt={item.pgl1_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="">
                  <p className="">{item.pgl1_name}</p>
                  <p className="text-sm text-text_disabled">{item.pgl1_description}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <section className="flex flex-col items justify-center text-center my-8">
            <h2 className="font-bold text-lg">No Games</h2>
            <p className="">You haven`t added any games yet. To get started, click Add Games.</p>
            <div className="mt-4">
              <button
                onClick={() => setIsCreateGameModal(true)}
                className="bg-accent_secondary px-6 py-2 rounded-lg"
              >
                Add Games
              </button>
            </div>
          </section>
        )}

        {gameRecords && gameRecords?.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="font-bold text-lg">Unregistered Games</h2>
            <hr className="border-white/10" />
            <div className="">
              {gameRecords.map((item, index) => (
                <Link
                  key={index}
                  className="px-8 py-4 hover:bg-background_secondary flex gap-6 items-center"
                  to={'/studio/update/' + item.game_id.toString()}
                >
                  <div className="flex gap-6 items-center">
                    <div className="h-12 aspect-video">
                      <img
                        src={ImageLoading}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="">{item.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </section>

      {/* modal  */}
      {isCreateGameModal && (
        <div
          onClick={() => setIsCreateGameModal(false)}
          className="absolute w-full h-full right-0 top-0 p-8 z-50 flex justify-center items-center bg-black/10 backdrop-blur-md"
        >
          <NewGame setIsCreateGameModal={setIsCreateGameModal} />
        </div>
      )}
    </div>
  );
};
