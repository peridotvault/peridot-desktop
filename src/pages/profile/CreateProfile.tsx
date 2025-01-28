// @ts-ignore
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  faEarthAsia,
  faEnvelope,
  faSeedling,
  faTv,
  faUser,
  faVenusMars,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createAccount } from "../../contexts/UserContext";
import { useWallet } from "../../contexts/WalletContext";
import { useNavigate } from "react-router-dom";

interface MetadataCreateUser {
  username: string;
  displayName: string;
  email: string;
  age: number | string;
  gender: string;
  country: string;
}

export const CreateProfile = () => {
  const [metadataCreateUser, setMetadataCreateUser] =
    useState<MetadataCreateUser>({
      username: "",
      displayName: "",
      email: "",
      age: "",
      gender: "",
      country: "",
    });
  const { wallet } = useWallet();
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setMetadataCreateUser((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
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
      const result = await createAccount(metadataCreateUser, "ifal12", wallet);
      if (result) {
        // Handle successful creation
        console.log("Account created successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const inputFields = [
    {
      name: "username",
      icon: faUser,
      type: "text",
      placeholder: "username",
      className: "lowercase",
    },
    {
      name: "displayName",
      icon: faTv,
      type: "text",
      placeholder: "Display Name",
      className: "",
    },
    {
      name: "email",
      icon: faEnvelope,
      type: "email",
      placeholder: "example@email.com",
      className: "",
    },
    {
      name: "age",
      icon: faSeedling,
      type: "number",
      placeholder: "Age",
      className: "",
    },
    {
      name: "gender",
      icon: faVenusMars,
      type: "text",
      placeholder: "Gender",
      className: "",
    },
    {
      name: "country",
      icon: faEarthAsia,
      type: "text",
      placeholder: "Country",
      className: "",
    },
  ];

  return (
    <main className="w-full min-h-dvh flex flex-col justify-center items-center">
      <div className="container flex flex-col justify-center items-center gap-6">
        <p className="text-xl mb-3">Create Account</p>
        {inputFields.map((field) => (
          <section
            key={field.name}
            className="flex rounded-xl overflow-hidden border border-text_disabled/30"
          >
            <div className="h-14 w-14 flex justify-center items-center">
              <FontAwesomeIcon
                icon={field.icon}
                className="text-text_disabled"
              />
            </div>
            <input
              type={field.type}
              name={field.name}
              className={`w-80 bg-transparent shadow-sunken-sm px-3 ${field.className}`}
              placeholder={field.placeholder}
              value={metadataCreateUser[field.name as keyof MetadataCreateUser]}
              onChange={handleInputChange}
            />
          </section>
        ))}
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
