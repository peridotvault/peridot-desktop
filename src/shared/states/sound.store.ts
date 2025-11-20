import { create } from 'zustand';

type SoundState = {
    enabled: boolean;
    volume: number;
    setVolume: (volume: number) => void;
    toggleEnabled: () => void;
};

export const useSoundStore = create<SoundState>((set) => ({
    enabled: true,
    volume: 0.6,

    setVolume: (volume) => set({ volume }),
    toggleEnabled: () => set((s) => ({ enabled: !s.enabled })),
}));
