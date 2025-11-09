import React from 'react';

function useClickSound(url = '/sounds/click.mp3', volume = 0.6) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const a = new Audio(url);
    a.preload = 'auto';
    a.volume = volume;
    audioRef.current = a;
  }, [url, volume]);

  const play = React.useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {
      /* ignore */
    });
  }, []);

  return play;
}

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
