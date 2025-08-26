// @ts-ignore
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudioSidebar } from './StudioSidebar';
import Stepper, { Step } from '../../components/atoms/Stepper';
import { InputFieldComponent } from '../../components/atoms/InputFieldComponent';
import { faHeader } from '@fortawesome/free-solid-svg-icons';
import { createApp } from '../../blockchain/icp/app/services/ICPAppService';
import { CreateAppInterface } from '../../interfaces/app/AppInterface';
import { useWallet } from '../../contexts/WalletContext';
import { initAppStorage } from '../../api/wasabiClient';

export const StudioMainLayout = () => {
  const { wallet } = useWallet();
  const [isCreateAppModal, setIsCreateAppModal] = useState<Boolean>(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
      // if (title.trim().length < 3) return "Judul minimal 3 karakter.";
    }
    if (step === 3) {
      if (!description.trim()) return 'fill this form';
      // if (description.trim().length < 3)
      // return "Deskripsi minimal 10 karakter.";
    }
    return null;
  };

  return (
    <main className="pt-20 flex flex-1">
      {/* Fixed sidebar with its own scroll */}
      <div className="fixed w-[70px] top-20 left-0 bottom-0" data-lenis-prevent>
        <StudioSidebar setIsCreateAppModal={() => setIsCreateAppModal(true)} />
      </div>
      {/* Main content with offset and Lenis scroll */}
      <div className="ml-[70px] flex-1 w-full">
        {isCreateAppModal && (
          <div
            onClick={() => setIsCreateAppModal(false)}
            className="absolute w-full h-full left-0 top-0 flex justify-center items-center bg-black/10 backdrop-blur-md"
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
        <Outlet />
      </div>
    </main>
  );
};
