import { useClickSound } from '@shared/hooks/use-click-sound';
import React from 'react';

type ButtonWithSoundProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  soundUrl?: string;
  soundVolume?: number;
};

export const ButtonWithSound = React.forwardRef<HTMLButtonElement, ButtonWithSoundProps>(
  (
    { soundUrl = '/sounds/click.mp3', soundVolume = 0.6, onClick, disabled, children, ...rest },
    ref,
  ) => {
    const play = useClickSound(soundUrl, soundVolume);

    return (
      <button
        ref={ref}
        {...rest}
        disabled={disabled}
        onClick={(e) => {
          if (!disabled) play();
          onClick?.(e);
        }}
      >
        {children ?? 'Click me'}
      </button>
    );
  },
);
ButtonWithSound.displayName = 'ButtonWithSound';
