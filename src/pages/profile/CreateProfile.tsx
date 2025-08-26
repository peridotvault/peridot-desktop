// @ts-ignore
import React, { ChangeEvent, ChangeEventHandler, useState } from 'react';
import {
  faChevronLeft,
  faEarthAsia,
  faEnvelope,
  faSeedling,
  faTv,
  faUser,
  faVenusMars,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useWallet } from '../../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import countriesData from '../../assets/json/countries.json';
import { clearWalletData } from '../../utils/StoreService';
import { CreateUserInterface, Gender } from '../../interfaces/user/UserInterface';
import {
  createAccount,
  getIsUsernameValid,
} from '../../blockchain/icp/user/services/ICPUserService';
import { ApiResponse } from '../../interfaces/CoreInterface';

interface CountryOption {
  code: string;
  name: string;
}

const AccountSettingsInputField = ({
  name,
  icon,
  type,
  placeholder,
  className,
  value,
  onChange,
}: {
  name: string;
  icon: IconDefinition;
  type: string;
  placeholder: string;
  className: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  return (
    <section className="flex flex-col gap-3">
      <p className="capitalize font-semibold">
        {placeholder} <label className="text-accent_primary"> *</label>
      </p>
      <div className="flex rounded-xl overflow-hidden border border-text_disabled/30">
        <div className="h-14 w-14 flex justify-center items-center">
          <FontAwesomeIcon icon={icon} className="text-text_disabled" />
        </div>
        <input
          required
          type={type}
          name={name}
          className={`w-full bg-transparent shadow-sunken-sm px-3 ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </section>
  );
};

const AccountSettingsDropdownField = ({
  name,
  icon,
  placeholder,
  className,
  value,
  options,
  onChange,
}: {
  name: string;
  icon: IconDefinition;
  placeholder: string;
  className: string;
  value: string;
  options: { code: string; name: string }[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) => {
  const displayValue = typeof value === 'object' ? Object.keys(value)[0] : value;
  return (
    <section className="flex flex-col gap-3">
      <p className="capitalize font-semibold">
        {placeholder} <label className="text-accent_primary"> *</label>
      </p>
      <div className="flex rounded-xl overflow-hidden border border-text_disabled/30">
        <div className="h-14 w-14 flex justify-center items-center">
          <FontAwesomeIcon icon={icon} className="text-text_disabled" />
        </div>
        <select
          name={name}
          className={`w-full bg-transparent shadow-sunken-sm px-3 ${className}`}
          value={displayValue}
          onChange={onChange}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export const CreateProfile = () => {
  const { setWallet, setIsGeneratedSeedPhrase } = useWallet();
  const [isValidUsername, setIsValidUsername] = useState({
    valid: true,
    msg: '',
  });
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const { wallet } = useWallet();
  const navigate = useNavigate();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(e.target.value);
  };

  function dateToNanoSeconds(dateStr: string): bigint {
    // Expect "YYYY-MM-DD"
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!m) throw new Error('Invalid date format, expected YYYY-MM-DD');
    const [_, y, mo, d] = m;
    const ms = Date.UTC(Number(y), Number(mo) - 1, Number(d)); // milliseconds UTC
    return BigInt(ms) * 1_000_000n; // -> nanoseconds
  }

  const handleSubmit = async (
    username: string,
    displayName: string,
    email: string,
    birthDate: string,
    gender: string,
    country: string,
  ) => {
    const genderVariant: Gender = {
      [gender]: null,
    } as Gender;
    // Validation before submission
    const metadataCreateUser: CreateUserInterface = {
      username: username,
      displayName: displayName,
      email: email,
      birthDate: dateToNanoSeconds(birthDate),
      gender: genderVariant,
      country: country,
    };
    const isFormValid = Object.values(metadataCreateUser).every(
      (value) => value !== '' && value !== null,
    );

    if (!isFormValid) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await createAccount({
        metadata: metadataCreateUser,
        wallet: wallet,
      });
      if (result) {
        // Handle successful creation
        console.log('Account created successfully');
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const genderOptions: CountryOption[] = [
    { code: 'male', name: 'Male' },
    { code: 'female', name: 'Female' },
    { code: 'other', name: 'Other' },
  ];
  const countryOptions: CountryOption[] = countriesData;

  const clearSeedPhrase = async () => {
    await clearWalletData();
    setIsGeneratedSeedPhrase(false);
    setWallet((prevWallet) => ({
      ...prevWallet,
      encryptedSeedPhrase: null,
      principalId: null,
      accountId: null,
      encryptedPrivateKey: null,
      lock: null,
      verificationData: null,
    }));
  };

  return (
    <main className="w-full min-h-dvh flex flex-col items-center">
      {/* Header  */}
      <div className="flex justify-between items-center w-full py-6">
        <button
          onClick={() => {
            clearSeedPhrase();
            navigate('/login');
          }}
          className=" w-10 h-10 flex justify-center items-center rounded-xl"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
        </button>
        <p className="text-xl font-semibold">Create Account</p>
        <div className="w-10 h-10"></div>
      </div>

      {/* Content  */}
      <div className="container flex flex-col justify-center items-center gap-8 mt-6">
        <section className="flex flex-col gap-6">
          <div className="">
            <AccountSettingsInputField
              name="username"
              icon={faUser}
              type="text"
              placeholder="username"
              className="lowercase"
              value={username}
              onChange={async (e) => {
                handleInputChange(e, setUsername);
                const result: ApiResponse<Boolean> = await getIsUsernameValid(e.target.value);

                if ('err' in result) {
                  const error = result as { err: { InvalidInput: string } };
                  setIsValidUsername({
                    valid: false,
                    msg: error.err.InvalidInput ?? 'Invalid username',
                  });
                } else {
                  setIsValidUsername({ valid: true, msg: 'username valid' });
                }
              }}
            />
            <p className={` ${isValidUsername.valid ? 'text-success' : 'text-danger'}`}>
              {isValidUsername.msg}
            </p>
          </div>
          <AccountSettingsInputField
            name="displayName"
            icon={faTv}
            type="text"
            placeholder="Display Name"
            className=""
            value={displayName}
            onChange={(e) => handleInputChange(e, setDisplayName)}
          />
          <AccountSettingsInputField
            name="email"
            icon={faEnvelope}
            type="email"
            placeholder="Email"
            className=""
            value={email}
            onChange={(e) => handleInputChange(e, setEmail)}
          />
          <AccountSettingsInputField
            name="birthDate"
            icon={faSeedling}
            type="date"
            placeholder="Birth Date"
            className=""
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <AccountSettingsDropdownField
            name="gender"
            icon={faVenusMars}
            placeholder="Gender"
            className=""
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={genderOptions}
          />
          <AccountSettingsDropdownField
            name="country"
            icon={faEarthAsia}
            placeholder="Country"
            className=""
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            options={countryOptions}
          />
        </section>
        <button
          onClick={() => handleSubmit(username, displayName, email, birthDate, gender, country)}
          className="w-52 p-3 rounded-xl hover:shadow-arise-sm shadow-flat-sm duration-300 hover:text-white text-text_disabled"
        >
          Submit
        </button>
      </div>
    </main>
  );
};
