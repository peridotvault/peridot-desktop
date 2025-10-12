// @ts-ignore
import React, { useEffect, useRef, useState } from 'react';
import { Option } from '../../interfaces/app/GameInterface';

type MultiSelectProps = {
  maxValue: number;
  placeholder: string;
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
};

export const MultiSelectComponent = ({
  maxValue,
  placeholder,
  options,
  selected,
  onChange,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOption = (option: Option) => {
    const isSelected = selected.find((o) => o.value === option.value);
    if (isSelected) {
      onChange(selected.filter((o) => o.value !== option.value));
    } else {
      if (selected.length >= maxValue) {
        setIsOpen(false);
        return;
      }
      onChange([...selected, option]);
    }
  };

  // Filter opsi berdasarkan search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 relative w-full" ref={containerRef}>
      <label className="capitalize font-semibold flex items-center gap-2">
        {placeholder}
        <span className="text-accent_primary">*</span>
      </label>
      <div
        className={`border border-text_disabled/30 rounded-lg p-2 cursor-text flex flex-wrap gap-2 min-h-[40px] max-h-44 overflow-auto duration-300  ${
          isOpen ? 'shadow-arise-sm' : 'shadow-sunken-sm'
        }`}
        onClick={() => setIsOpen(true)}
      >
        {selected.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleOption(option);
            }}
            className="rounded-md bg-background_disabled px-2 py-1 flex items-center gap-2 hover:bg-danger duration-300"
          >
            <span>{option.label}</span>
            <div className="">&times;</div>
          </button>
        ))}
        <input
          type="text"
          value={search}
          hidden={selected.length >= maxValue}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length === 0 ? placeholder : 'Search...'}
          className="grow min-w-[120px] border-none outline-none bg-transparent px-1 py-1"
        />
      </div>
      {isOpen && selected.length < maxValue ? (
        <ul className="absolute z-10 max-h-52 w-full overflow-auto rounded-xl border border-text_disabled/30 bg-background_primary shadow-lg top-full flex flex-col">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  toggleOption(option);
                  setSearch('');
                  setIsOpen(true);
                }}
                className={`cursor-pointer px-3 py-2 hover:bg-background_disabled/50 ${
                  selected.find((o) => o.value === option.value)
                    ? 'bg-background_disabled border-y border-text_disabled/30'
                    : ''
                }`}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">Tidak ada hasil</li>
          )}
        </ul>
      ) : (
        ''
      )}
    </div>
  );
};
