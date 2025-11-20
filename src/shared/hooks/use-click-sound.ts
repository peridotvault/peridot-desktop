import { useEffect, useCallback } from 'react';
import { useSoundStore } from '@shared/states/sound-store';

export function useClickSound(url: string, volume: number) {
    const init = useSoundStore((s) => s.init);
    const playClick = useSoundStore((s) => s.playClick);
    const enabled = useSoundStore((s) => s.enabled);

    useEffect(() => {
        init(url, volume);
    }, [url, volume, init]);

    return useCallback(() => {
        if (!enabled) return;
        playClick();
    }, [enabled, playClick]);
}