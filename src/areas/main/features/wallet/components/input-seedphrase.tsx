// @ts-ignore
import React, { useState, useRef, useEffect } from 'react';
import { InputField } from '@shared/components/atoms/InputField';
import { copyToClipboard } from '@shared/utils/Additional';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/free-solid-svg-icons';
import { validateMnemonic, wordlists } from 'bip39';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';

interface SeedPhraseInputProps {
  onContinue: (seedPhrase: string) => void;
  seedPhrase?: string;
}

export const SeedPhraseInput = ({ onContinue, seedPhrase }: SeedPhraseInputProps) => {
  const EN = wordlists.english;
  const [words, setWords] = useState(Array(12).fill(''));
  const [errors] = useState(Array(12).fill(false));

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seedPhrase) {
      const splitWords = seedPhrase.trim().split(/\s+/);
      const padded = [...splitWords, ...Array(12 - splitWords.length).fill('')];
      setWords(padded.slice(0, 12));
    }
  }, [seedPhrase]);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key;

    if (key === ' ' && words[index].trim() !== '') {
      // tekan spasi -> pindah ke input berikutnya
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.current.length) {
        inputRefs.current[nextIndex]?.focus();
      }
    } else if (key === 'Backspace' && words[index] === '') {
      // tekan backspace saat input kosong -> pindah ke sebelumnya
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        e.preventDefault();
        inputRefs.current[prevIndex]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pastedWords = paste.trim().split(/\s+/); // split by space or newline

    const newWords = [...words];
    for (let i = 0; i < pastedWords.length && index + i < 12; i++) {
      newWords[index + i] = pastedWords[i];
    }

    setWords(newWords);

    // Set focus ke input terakhir yang dipaste
    const lastIndex = Math.min(index + pastedWords.length - 1, 11);
    inputRefs.current[lastIndex]?.focus();
  };

  const isValid = () => {
    // harus 12 kata & semuanya terisi
    if (words.length !== 12) return false;
    const cleaned = words.map((w) => w.trim().toLowerCase());
    if (!cleaned.every((w) => w.length > 0)) return false;

    // pastikan semua kata ada di wordlist BIP39 English
    if (!cleaned.every((w) => EN.includes(w))) return false;

    // cek checksum mnemonic
    return validateMnemonic(cleaned.join(' '), EN);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isValid()) {
      console.log('Seed Phrase:', words.join(' '));
    } else {
      console.error('Please fill in all fields.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto rounded-lg shadow-md flex flex-col gap-6"
    >
      <div className="grid grid-cols-3 gap-4">
        {words.map((word, index) => (
          <WordInput
            key={index}
            index={index}
            value={word}
            disabled={seedPhrase ? true : false}
            onChange={handleWordChange}
            error={errors[index]}
            inputRef={(el) => (inputRefs.current[index] = el)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <div className="flex">
        {seedPhrase ? (
          <ButtonWithSound
            className="w-full text-sm flex gap-2 items-center duration-300 hover:scale-105 hover:cursor-pointer"
            onClick={() => copyToClipboard(seedPhrase)}
          >
            <FontAwesomeIcon icon={faClone} />
            Copy to Clipboard
          </ButtonWithSound>
        ) : (
          ''
        )}

        <ButtonWithSound
          type="submit"
          onClick={() => {
            if (isValid()) {
              const phrase = words.join(' ').trim();
              onContinue(phrase);
            }
          }}
          className={`w-full bg-linear-to-tr from-accent-foreground to-accent text-foreground font-bold p-3 rounded-xl ${
            isValid() ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
          disabled={!isValid()}
        >
          Continue
        </ButtonWithSound>
      </div>
    </form>
  );
};

const WordInput = ({
  index,
  value,
  onChange,
  inputRef,
  onKeyDown,
  onPaste,
  disabled,
}: {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  error: boolean;
  disabled: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>, index: number) => void;
}) => {
  return (
    <div>
      <InputField
        ref={inputRef}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={(index + 1).toString()}
        onChange={(e) => onChange(index, e)}
        onKeyDown={(e) => onKeyDown(e, index)}
        onPaste={(e) => onPaste(e, index)}
      />
    </div>
  );
};
