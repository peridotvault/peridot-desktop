// @ts-ignore
import React, { useEffect, useState } from 'react';
import { AppInterface, CreateAppInterface } from '../../interfaces/app/AppInterface';
import { createApp, getAppByDeveloperId } from '../../blockchain/icp/app/services/ICPAppService';
import { useWallet } from '../../contexts/WalletContext';
import { initAppStorage } from '../../api/wasabiClient';
import Stepper, { Step } from '../../components/atoms/Stepper';
import { InputFieldComponent } from '../../components/atoms/InputFieldComponent';
import { faHeader, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/molecules/Alert';

export const CreateAppPage = () => {
  const { wallet } = useWallet();

  const [apps, setApps] = useState<AppInterface[] | null>(null);
  const [isCreateAppModal, setIsCreateAppModal] = useState<Boolean>(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return; // jaga2 kalau wallet belum siap
        const listApp = await getAppByDeveloperId({ wallet });
        if (isMounted) setApps(listApp);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [wallet]);

  const handleCreateApp = async () => {
    try {
      const createData: CreateAppInterface = {
        title: title,
        description: description,
      };
      const appCreated = await createApp({
        createAppTypes: createData,
        wallet,
      });
      await initAppStorage(Number(appCreated.appId).toString());

      setIsCreateAppModal(false);
    } catch (err: any) {
      console.error(err?.message);
    }
  };

  const validateStep = (step: number): string | null => {
    if (step === 2) {
      if (!title.trim()) return 'fill this form';
    }
    if (step === 3) {
      if (!description.trim()) return 'fill this form';
    }
    return null;
  };

  //   async function handleDelete(appId: number) {
  //     try {
  //       const resultMsg = await deleteApp({ wallet, appId });
  //       // kalau API balikin string atau status, bisa dicek disini
  //       setAlert({ type: 'success', message: 'App berhasil dihapus!' });

  //       // update list setelah delete
  //       setApps((prev) => prev?.filter((a) => Number(a.appId) !== appId) ?? null);
  //       console.log(resultMsg);
  //     } catch (err) {
  //       console.error(err);
  //       setAlert({ type: 'error', message: 'Gagal menghapus app.' });
  //     }
  //   }

  return (
    <div className="flex flex-col w-full max-w-[1400px] p-8">
      {/* header   */}
      <section className="text-4xl flex flex-col gap-4 ">
        <div className="flex items-center gap-4">
          <h1 className="font-bold">Games</h1>
          <button
            onClick={() => setIsCreateAppModal(true)}
            className={
              'flex aspect-square text-lg bg-accent_secondary rounded-full w-8 h-8 items-center justify-center duration-300 hover:shadow-flat-sm'
            }
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <hr className="border-t border-white/20" />
      </section>

      {/* List Games   */}
      <section className="mt-8">
        {apps?.map((item, index) => (
          <Link
            className="border-b border-text_disabled/25 px-8 py-4 hover:bg-background_secondary flex gap-6 items-center justify-between"
            key={index}
            to={'/studio/update/' + item.appId.toString()}
          >
            <div className="flex gap-6 items-start">
              <div className="w-12 aspect-[3/4]">
                <img
                  src={
                    item.coverImage === null ? item.coverImage : './assets/img/cover2_not_found.png'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="">
                <p className="">{item.title}</p>
                <p className="text-sm text-text_disabled">{item.description}</p>
              </div>
            </div>
            {/* <div className="w-1/4 h-full cursor-default" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => handleDelete(Number(item.appId))}>
                <FontAwesomeIcon icon={faTrash} className="text-danger" />
              </button>
            </div> */}
          </Link>
        ))}

        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </section>

      {/* modal  */}
      {isCreateAppModal && (
        <div
          onClick={() => setIsCreateAppModal(false)}
          className="absolute w-full h-full right-0 top-0 flex justify-center items-center bg-black/10 backdrop-blur-md"
        >
          <Stepper
            initialStep={1}
            onStepChange={(step) => {
              if (step == 2) console.log(step);
            }}
            onFinalStepCompleted={handleCreateApp}
            validateStep={validateStep}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            <Step>
              <h2>Creating App just need 2 steps</h2>
            </Step>
            <Step>
              <InputFieldComponent
                icon={faHeader}
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="App Title"
                type="text"
                value={title}
              />
            </Step>
            <Step>
              <InputFieldComponent
                icon={faHeader}
                name="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                type="text"
                value={description}
              />
            </Step>
            <Step>
              <h2>Final Step</h2>
              <p>You made it!</p>
            </Step>
          </Stepper>
        </div>
      )}
    </div>
  );
};
