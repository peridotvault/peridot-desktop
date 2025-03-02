// @ts-ignore
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  faEarthAsia,
  faEnvelope,
  faSeedling,
  faTv,
  faUser,
  faVenusMars,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createAccount,
  GenderVariant,
  MetadataCreateUser,
} from "../../contexts/UserContext";
import { useWallet } from "../../contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import countriesData from "../../assets/json/countries.json";

interface CountryOption {
  code: string;
  name: string;
}

export const CreateProfile = () => {
  const [metadataCreateUser, setMetadataCreateUser] =
    useState<MetadataCreateUser>({
      username: "",
      display_name: "",
      email: "",
      birth_date: "",
      gender: { other: null },
      country: "",
    });
  const { wallet } = useWallet();
  const navigate = useNavigate();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "gender") {
      // Special handling for gender to create the variant structure
      const genderVariant: GenderVariant = {
        [value as keyof GenderVariant]: null,
      } as GenderVariant;
      setMetadataCreateUser((prev) => ({
        ...prev,
        gender: genderVariant,
      }));
    } else {
      setMetadataCreateUser((prev) => ({
        ...prev,
        [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
      }));
    }
  };

  const AccountSettingsInputField = ({
    name,
    icon,
    type,
    placeholder,
    className,
    value,
  }: {
    name: string;
    icon: IconDefinition;
    type: string;
    placeholder: string;
    className: string;
    value: string;
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
            type={type}
            name={name}
            className={`w-full bg-transparent shadow-sunken-sm px-3 ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
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
  }: {
    name: string;
    icon: IconDefinition;
    placeholder: string;
    className: string;
    value: string | GenderVariant;
    options: { code: string; name: string }[];
  }) => {
    const displayValue =
      name === "gender" && typeof value === "object"
        ? Object.keys(value)[0]
        : String(value);
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
            onChange={handleInputChange}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </section>
    );
  };

  const handleSubmit = async () => {
    // Validation before submission
    const isFormValid = Object.values(metadataCreateUser).every(
      (value) => value !== "" && value !== null
    );

    if (!isFormValid) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const result = await createAccount(metadataCreateUser, wallet);
      if (result) {
        // Handle successful creation
        console.log("Account created successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const genderOptions: CountryOption[] = [
    { code: "male", name: "Male" },
    { code: "female", name: "Female" },
    { code: "other", name: "Other" },
  ];
  const countryOptions: CountryOption[] = countriesData;

  return (
    <main className="w-full min-h-dvh flex flex-col justify-center items-center">
      <div className="container flex flex-col justify-center items-center gap-6">
        <p className="text-xl mb-3">Create Account</p>
        <section className="flex flex-col gap-6">
          <AccountSettingsInputField
            name="username"
            icon={faUser}
            type="text"
            placeholder="username"
            className="lowercase"
            value={metadataCreateUser.username}
          />
          <AccountSettingsInputField
            name="display_name"
            icon={faTv}
            type="text"
            placeholder="Display Name"
            className=""
            value={metadataCreateUser.display_name}
          />
          <AccountSettingsInputField
            name="email"
            icon={faEnvelope}
            type="email"
            placeholder="Email"
            className=""
            value={metadataCreateUser.email}
          />
          <AccountSettingsInputField
            name="birth_date"
            icon={faSeedling}
            type="date"
            placeholder="Birth Date"
            className=""
            value={metadataCreateUser.birth_date}
          />
          <AccountSettingsDropdownField
            name="gender"
            icon={faVenusMars}
            placeholder="Gender"
            className=""
            value={metadataCreateUser.gender}
            options={genderOptions}
          />
          <AccountSettingsDropdownField
            name="country"
            icon={faEarthAsia}
            placeholder="Country"
            className=""
            value={metadataCreateUser.country}
            options={countryOptions}
          />
        </section>
        <button
          onClick={handleSubmit}
          className="w-52 p-3 rounded-xl hover:shadow-arise-sm shadow-flat-sm duration-300 hover:text-white text-text_disabled"
        >
          Submit
        </button>
      </div>
    </main>
  );
};
