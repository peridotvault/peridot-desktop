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
    <main className="flex justify-center items-center h-screen p-6 flex-col gap-6">
      <button className="fixed left-5 top-5" onClick={backFunction}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <p className="text-lg">Create Password</p>
      <div className=""></div>
      <input
        type="password"
        name="password"
        className="border border-white/10 shadow-sunken-lg p-3 w-72 rounded-lg text-white bg-background_primary outline-none"
        placeholder="Enter your password"
        value={password || ''}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        name="confirmPassword"
        className="border border-white/10 shadow-sunken-lg p-3 w-72 rounded-lg text-white bg-background_primary outline-none"
        placeholder="Confirm your password"
        value={confirmPassword || ''}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* debug user  */}
      {password.length < 5 && password !== '' ? (
        <p className="text-red-500 text-sm">your password less then 5</p>
      ) : password !== confirmPassword && confirmPassword !== '' ? (
        <p className="text-red-500 text-sm">your password not same</p>
      ) : (
        <div className=""></div>
      )}

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
    </main>
  );
};
