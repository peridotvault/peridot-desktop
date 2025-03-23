// @ts-ignore
import React from "react";

interface InputFieldProps {
  text: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  type?: string;
  name?: string;
}

export const InputField = ({
  text,
  onChange,
  placeholder,
  disabled = false,
  type = "password",
  name = "Password",
}: InputFieldProps) => {
  return (
    <input
      type={type}
      name={name}
      className={`border border-white/10 focus:shadow-arise-sm p-3 w-full duration-300 rounded-lg bg-background_primary outline-none ${
        disabled ? "text-text_disabled shadow-flat-sm" : "shadow-sunken-sm "
      }`}
      placeholder={placeholder}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
};
