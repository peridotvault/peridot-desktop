import { create } from 'zustand'

type SoundState = {
    clickAudio: HTMLAudioElement | null;
    enabled: boolean;
    volume: number;
    init: (url: string, volume?: number) => void;
    playClick: () => void;
    setVolume: (volume: number) => void;
    toggleEnabled: () => void;
};


export const useSoundStore = create<SoundState>((set, get) => ({
    clickAudio: null,
    enabled: true,
    volume: 0.6,

    init: (url: string, volume = 0.6) => {
        const { clickAudio } = get();

        if (clickAudio && clickAudio.src.includes(url)) {
            clickAudio.volume = volume;
            return set({ volume });
        }

        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = volume;

        set({ clickAudio: audio, volume });
    },

    playClick: () => {
        const { clickAudio, enabled } = get();
        if (!enabled || !clickAudio) return;
        clickAudio.currentTime = 0;
        void clickAudio.play();
    },

    setVolume: (volume: number) => {
        const { clickAudio } = get();
        if (clickAudio) clickAudio.volume = volume;
        set({ volume });
    },

    toggleEnabled: () => set((s) => ({ enabled: !s.enabled })),
}))
