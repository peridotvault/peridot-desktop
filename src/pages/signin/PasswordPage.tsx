import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonWithSound } from '../../components/atoms/button-with-sound';
import { InputFloating } from '../../components/atoms/input-floating';

interface PasswordProps {
  backFunction: () => void;
  handlePassword: (password: string) => void;
}

export const PasswordPage: React.FC<PasswordProps> = ({ backFunction, handlePassword }) => {
  const { setWallet } = useWallet();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (password !== '' && password === confirmPassword && password.length >= 5) {
      // First update the wallet with the password
      setWallet((prev) => ({
        ...prev,
        password: password,
      }));

      // Then call the parent's handlePassword with the password
      handlePassword(password);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* button back  */}
      <div className="flex items-center justify-between w-full">
        <ButtonWithSound
          className="flex items-center cursor-pointer gap-2 border px-6 py-3 rounded-xl border-foreground/20"
          onClick={backFunction}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Back</span>
        </ButtonWithSound>
      </div>

      <div className="border border-foreground/20 rounded-3xl flex justify-center items-center px-8 py-6 flex-col gap-6">
        <div className="flex flex-col w-full gap-4">
          <h2 className="text-2xl font-bold">Create Your Password</h2>
          <hr className="border-t border-foreground/20" />
          <p className="text-sm">Now enter your password to continue registration</p>
        </div>

        <div className="flex flex-col gap-4 w-96">
          <InputFloating
            placeholder="Enter your password"
            type="password"
            value={password || ''}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <InputFloating
            placeholder="Confirm your password"
            type="password"
            value={confirmPassword || ''}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {/* button  */}
        <ButtonWithSound
          onClick={handleSubmit}
          className={`bg-foreground border-foreground text-black py-3 px-10 rounded-full  ${
            password !== '' && password === confirmPassword && password.length >= 5
              ? 'cursor-pointer'
              : 'opacity-30 cursor-not-allowed '
          }`}
        >
          Create Password
        </ButtonWithSound>

        {/* debug user  */}
        {password.length < 5 && password !== '' ? (
          <p className="text-red-500 text-sm">your password less then 5</p>
        ) : password !== confirmPassword && confirmPassword !== '' ? (
          <p className="text-red-500 text-sm">your password not same</p>
        ) : (
          <div className=""></div>
        )}
      </div>
    </div>
  );
};
