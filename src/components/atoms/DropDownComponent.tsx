// @ts-ignore
import React, { ChangeEventHandler } from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Gender } from '../../interfaces/user/UserInterface';
import { Distribution } from '@shared/interfaces/game';

export const DropDownComponent = ({
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
  value: string | Gender | Distribution;
  options: { code: string; name: string }[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) => {
  const displayValue =
    name === 'gender' && typeof value === 'object' ? Object.keys(value)[0] : String(value);
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
