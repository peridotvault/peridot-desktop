// @ts-ignore
import React, { useState } from 'react';
import { InputField } from '../../components/atoms/InputField';
import { ButtonTransaction } from '../../components/atoms/ButtonTransaction';
import { useWallet } from '@shared/contexts/WalletContext';
import { createDeveloperProfile } from '@features/profile/services/user.service';
import { AppPayment } from '../../features/wallet/views/Payment';
import { useNavigate } from 'react-router-dom';

export default function CreateDeveloper() {
  const { wallet } = useWallet();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isOnPayment, setIsOnPayment] = useState(false);
  const priceUpgradeToDeveloperAccount = 10;
  const navigate = useNavigate();

  async function handlePayment() {
    try {
      const result = await createDeveloperProfile({
        wallet: wallet,
        websiteUrl: websiteUrl,
        bio: bio,
      });
      console.log(result);
      navigate('/studio');
    } catch (error) {
      throw error;
    }
  }
  return (
    <div className="pt-20 w-full min-h-dvh flex justify-center items-center relative overflow-hidden">
      {/* form  */}
      <div
        aria-label="form"
        className="w-[400px] p-8 flex flex-col gap-6 bg-background rounded-2xl"
      >
        <div className="bg-card aspect-video rounded-xl flex flex-col justify-center items-center">
          <p className="text-muted-foreground">one-time payment for</p>
          <p className="text-5xl font-bold">{priceUpgradeToDeveloperAccount} PER</p>
        </div>
        {/* title  */}
        <h1 className="text-xl capitalize">Every Developer need Identity</h1>
        {/* Form  */}
        <div className="flex flex-col gap-4">
          <InputField
            onChange={(e) => setWebsiteUrl(e)}
            type="text"
            placeholder="Website Url"
            value={websiteUrl}
          />
          <InputField onChange={(e) => setBio(e)} type="text" placeholder="Bio" value={bio} />
        </div>
        {/* Alert  */}
        <p className="text-muted-foreground">
          *Alert! you can not REFUND but You still can change this details later
        </p>
        <ButtonTransaction onClick={() => setIsOnPayment(true)} text="Pay" />
        {isOnPayment && (
          <AppPayment
            price={Number(priceUpgradeToDeveloperAccount)}
            SPENDER={import.meta.env.VITE_PERIDOT_CANISTER_DIRECTORY_BACKEND}
            onClose={() => setIsOnPayment(false)}
            onExecute={handlePayment}
          />
        )}
      </div>
      {/* background  */}
      <div className="bg-radial absolute top-0 left-0 w-full h-full -z-10 opacity-30"></div>
    </div>
  );
}
