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
  required = true,
  disabled = false,
  onChange,
}: {
  name: string;
  icon: IconDefinition;
  type: string;
  placeholder: string;
  disabled?: boolean;
  value: string;
  required?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  const base =
    'w-full bg-transparent shadow-sunken-sm px-3 outline-none focus:shadow-arise-sm duration-300 placeholder:text-muted-foreground';

  const active = '';
  const inactive = 'opacity-50';

  return (
    <div className="flex flex-col gap-3">
      <p className="capitalize font-semibold">
        {placeholder} <label className="text-accent-foreground"> *</label>
      </p>
      <div className="flex rounded-xl overflow-hidden border border-muted-foreground/30">
        <div className="h-14 w-14 flex justify-center items-center">
          <FontAwesomeIcon icon={icon} className="text-muted-foreground" />
        </div>
        <input
          type={type}
          name={name}
          required={required}
          disabled={disabled}
          className={`${base} ${disabled ? inactive : active}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
