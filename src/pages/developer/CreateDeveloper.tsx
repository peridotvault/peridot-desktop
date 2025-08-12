// @ts-ignore
import React, { useState } from "react";
import { InputField } from "../../components/atoms/InputField";
import { ButtonTransaction } from "../../components/atoms/ButtonTransaction";
import { useWallet } from "../../contexts/WalletContext";
import { createDeveloperProfile } from "../../blockchain/icp/user/services/ICPUserService";
import { AppPayment } from "../../features/wallet/views/Payment";

export const CreateDeveloper = () => {
  const { wallet } = useWallet();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [bio, setBio] = useState("");
  const [isOnPayment, setIsOnPayment] = useState(false);

  async function handlePayment() {
    const result = await createDeveloperProfile({
      wallet: wallet,
      websiteUrl: websiteUrl,
      bio: bio,
    });
    console.log(result);
  }
  return (
    <div className="pt-20 w-full min-h-dvh flex justify-center items-center relative overflow-hidden">
      {/* form  */}
      <div
        aria-label="form"
        className="w-[400px] p-8 flex flex-col gap-6 bg-background_primary rounded-2xl"
      >
        <div className="bg-background_secondary aspect-video rounded-xl flex flex-col justify-center items-center">
          <p className="text-text_disabled">one-time payment for</p>
          <p className="text-5xl font-bold">10 USD</p>
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
          <InputField
            onChange={(e) => setBio(e)}
            type="text"
            placeholder="Bio"
            value={bio}
          />
        </div>
        {/* Alert  */}
        <p className="text-text_disabled">
          *Alert! you can not REFUND but You still can change this details later
        </p>
        <ButtonTransaction onClick={() => setIsOnPayment(true)} text="Pay" />
        {isOnPayment && (
          <AppPayment
            price={Number(10)}
            onClose={() => setIsOnPayment(false)}
            onExecute={handlePayment}
          />
        )}
      </div>
      {/* background  */}
      <div className="bg-radial absolute top-0 left-0 w-full h-full -z-10 opacity-30"></div>
    </div>
  );
};
