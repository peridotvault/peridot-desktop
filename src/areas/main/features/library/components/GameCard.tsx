// src/features/library/components/LibraryGameCard.tsx
import React from 'react';
import type { LibraryEntry } from '@shared/interfaces/library';
import { ImageLoading } from '@shared/constants/images';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';

interface LibraryGameCardProps {
  entry: LibraryEntry;
  onClick: () => void;
}

export const LibraryGameCard: React.FC<LibraryGameCardProps> = ({ entry, onClick }) => {
  const coverUrl = entry.coverVerticalImage || entry.bannerImage || ImageLoading;

  return (
    <ButtonWithSound
      onClick={onClick}
      className="w-[170px] aspect-3/4 bg-card rounded-xl overflow-hidden"
    >
      <img
        src={coverUrl}
        alt={entry.gameName}
        className="w-full h-full object-cover hover:scale-110 duration-300"
      />
    </ButtonWithSound>
  );
};
