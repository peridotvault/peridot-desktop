import { useEffect, useCallback } from 'react';
import { useSoundStore } from '@shared/states/sound.store';
import { preloadClickSound, playClickBuffer } from '@shared/lib/sound-engine';

export function useClickSound(url: string, volume: number) {
    const enabled = useSoundStore((s) => s.enabled);

    // preload sekali di mount
    useEffect(() => {
        // kita nggak nunggu di sini, cukup trigger preload
        void preloadClickSound(url);
    }, [url]);

    return useCallback(() => {
        if (!enabled) return;
        // kalau belum ke-load, dia akan nge-wait sekali; setelah itu super cepat
        void (async () => {
            await preloadClickSound(url);
            await playClickBuffer(volume);
        })();
    }, [enabled, url, volume]);
}
