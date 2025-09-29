import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
        <button
          className="flex items-center gap-2 border px-6 py-3 rounded-xl border-white/20"
          onClick={backFunction}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Back</span>
        </button>
      </div>

      <div className="border border-white/20 rounded-3xl flex justify-center items-center px-8 py-6 flex-col gap-6">
        <div className="flex flex-col w-full gap-4">
          <h2 className="text-2xl font-bold">Create Your Password</h2>
          <hr className="border-t border-white/20" />
          <p className="text-sm">Now enter your password to continue registration</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <input
            type="password"
            name="password"
            className="border border-white/10 shadow-sunken-lg p-3 w-96 rounded-lg text-white bg-background_primary outline-none"
            placeholder="Enter your password"
            value={password || ''}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            name="confirmPassword"
            className="border border-white/10 shadow-sunken-lg p-3 w-96 rounded-lg text-white bg-background_primary outline-none"
            placeholder="Confirm your password"
            value={confirmPassword || ''}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {/* button  */}
        <button
          onClick={handleSubmit}
          className={`bg-white text-black py-3 px-10 rounded-full ${
            password !== '' && password === confirmPassword && password.length >= 5
              ? ''
              : 'opacity-30 cursor-not-allowed '
          }`}
        >
          Create Password
        </button>

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
