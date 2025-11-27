import React, { useState } from 'react';
import { InputField } from '@components/atoms/InputField';
import { Contact } from '../views/SendToken';
import { getKvItem, setKvItem } from '@shared/database/app-db';
import { KV_KEYS } from '@shared/database/kv-keys';
import { STORAGE_EVENTS } from '@shared/database/events';

interface NavbarProps {
  onClose: () => void;
  address: string;
}

export const SaveContact: React.FC<NavbarProps> = ({ onClose, address }) => {
  const [emoji, setEmoji] = useState('');
  const [username, setUsername] = useState('');

  const handleAddContact = async () => {
    try {
      const newContact: Contact = {
        icon: emoji,
        username: username,
        address: address,
      };
      const currentContacts = (await getKvItem<Contact[]>(KV_KEYS.contacts)) ?? [];
      const updatedContacts = [...currentContacts, newContact];

      await setKvItem(KV_KEYS.contacts, updatedContacts);
      window.dispatchEvent(new Event(STORAGE_EVENTS.contactsChanged));
      onClose();
      return updatedContacts;
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      className="bg-black/40 z-10 absolute w-full h-full left-0 top-0 flex flex-col justify-end"
      onClick={onClose}
    >
      <div
        className="bg-background_primary p-10 rounded-t-2xl flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-semibold">Save Contact</p>
        {/* Emoji  */}
        <input
          type="text"
          className={`border border-white/10 focus:shadow-arise-sm p-3 w-full duration-300 rounded-lg bg-background_primary outline-none 
        shadow-sunken-sm 
      }`}
          placeholder="Emoji (ex : 🧩 🥳 🥱) "
          value={emoji}
          onChange={(e) => {
            const value = e.target.value;
            let firstChar = '';
            if ('Segmenter' in Intl) {
              // Type assertion untuk menghindari error TS
              const segmenter = new (Intl as any).Segmenter(undefined, {
                granularity: 'grapheme',
              });
              const segments = Array.from(
                segmenter.segment(value),
                (segment: any) => segment.segment,
              );
              firstChar = segments[0] || '';
            } else {
              // fallback menggunakan Array.from
              firstChar = Array.from(value)[0] || '';
            }
            setEmoji(firstChar);
          }}
        />
        {/* username  */}
        <InputField
          onChange={(e) => setUsername(e)}
          placeholder="@username"
          type="text"
          value={username}
        />
        {/* address  */}
        <InputField
          onChange={() => {}}
          placeholder="Contact Address"
          type="text"
          disabled={true}
          value={address}
        />

        <button
          onClick={handleAddContact}
          className="w-full text-lg rounded-lg font bg-linear-to-tr from-accent_primary to-accent_secondary p-2 hover:scale-105 duration-300"
        >
          Add Contact
        </button>
      </div>
    </div>
  );
};
