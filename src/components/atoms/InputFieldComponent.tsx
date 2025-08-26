// @ts-ignore
import React, { ChangeEventHandler } from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const InputFieldComponent = ({
  name,
  icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  name: string;
  icon: IconDefinition;
  type: string;
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  return (
    <div className="flex flex-col gap-3">
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
          required
          className={`w-full bg-transparent shadow-sunken-sm px-3 outline-none focus:shadow-arise-sm duration-300`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
