// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { ImportWallet } from './ImportWallet';
import { CreateWallet } from './CreateWallet';

export default function Login() {
  const { wallet } = useWallet();
  const navigate = useNavigate();
  const [isImportWallet, setIsImportWallet] = useState<boolean>(true);

  useEffect(() => {
    function checkWallet() {
      if (
        wallet.principalId &&
        wallet.accountId &&
        wallet.encryptedPrivateKey &&
        wallet.verificationData
      ) {
        navigate('/');
      }
    }

    checkWallet();
  });

  return (
    <main className="flex justify-center w-full h-dvh items-center gap-6">
      <div className="flex w-full h-full max-w-[1200px]">
        <section className="w-1/2 h-full flex items-center justify-center">
          <h1 className="text-8xl font-bold">Welcome</h1>
        </section>

        <section className="w-1/2 h-full flex items-center justify-center">
          {isImportWallet ? (
            <ImportWallet setIsImportWallet={setIsImportWallet} />
          ) : (
            <CreateWallet setIsImportWallet={setIsImportWallet} />
          )}
        </section>
      </div>
    </main>
  );
}
