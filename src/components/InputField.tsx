// @ts-ignore
import React from "react";

interface InputFieldProps {
  text: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  name?: string;
}

export const InputField = ({
  text,
  onChange,
  placeholder,
  type = "password",
  name = "Password",
}: InputFieldProps) => {
  return (
    <input
      type={type}
      name={name}
      className="border border-white/10 shadow-sunken-lg p-3 w-full rounded-lg text-white bg-background_primary outline-none"
      placeholder={placeholder}
      value={text}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
