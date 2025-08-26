// Alert.tsx
import React from 'react';
import GlassSurface from '../atoms/GlassSurface';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const bg =
    type === 'success'
      ? 'bg-green-500/20 border-green-500 text-green-700'
      : 'bg-red-500/20 border-red-500 text-red-700';

  return (
    <GlassSurface
      className={`fixed top-5 right-5 px-6 py-4 rounded-lg border shadow-lg z-50 ${bg}`}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-sm font-bold hover:opacity-70">
          ✕
        </button>
      </div>
    </GlassSurface>
  );
};
