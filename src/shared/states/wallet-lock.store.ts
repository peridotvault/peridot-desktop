import { create } from 'zustand';
import { walletService } from '@shared/services/wallet';
import type { EncryptedData } from '@shared/security/aes';

type LockStatus = 'checking' | 'locked' | 'unlocked';

type WalletLockState = {
    status: LockStatus;
    expiresAt: number | null;
    error: string | null;
    timerId: number | null;
    // actions
    initFromStorage: () => Promise<void>;
    unlockWithPassword: (password: string, verificationData: EncryptedData, minutes?: number) => Promise<void>;
    forceLock: () => Promise<void>;
};

function scheduleAutoLock(set: (fn: (state: WalletLockState) => Partial<WalletLockState>) => void, expiresAt: number) {
    const delay = expiresAt - Date.now();
    if (delay <= 0) {
        set((_s) => ({ status: 'locked', expiresAt: null, timerId: null }));
        return;
    }

    const id = window.setTimeout(() => {
        set((_s) => ({ status: 'locked', expiresAt: null, timerId: null }));
    }, delay);

    set((s) => {
        // clear timer lama kalau ada
        if (s.timerId) window.clearTimeout(s.timerId);
        return { timerId: id, expiresAt };
    });
}

export const useWalletLockStore = create<WalletLockState>((set, get) => ({
    status: 'checking',
    expiresAt: null,
    error: null,
    timerId: null,

    initFromStorage: async () => {
        try {
            const lock = await walletService.getLock();
            if (!lock) {
                // nggak ada lock = belum login / butuh password
                set((_s) => ({ status: 'locked', expiresAt: null, error: null }));
                return;
            }

            const isValid = Date.now() <= lock.expiresAt;

            if (isValid) {
                set((_s) => ({ status: 'unlocked', error: null }));
                scheduleAutoLock(set, lock.expiresAt);
            } else {
                await walletService.closeLock();
                set((_s) => ({ status: 'locked', expiresAt: null, error: null }));
            }
        } catch (e) {
            console.error('initFromStorage error', e);
            set((_s) => ({ status: 'locked', error: 'Failed to read lock state' }));
        }
    },

    unlockWithPassword: async (password, verificationData, minutes = 30) => {
        try {
            set((_s) => ({ error: null }));
            const lock = await walletService.openLock(password, verificationData, minutes);
            // kalau sukses, openLock sudah simpan ke KV
            set((_s) => ({ status: 'unlocked', error: null }));
            scheduleAutoLock(set, lock.expiresAt);
        } catch (e) {
            console.error('unlockWithPassword error', e);
            set((_s) => ({ error: 'Invalid password', status: 'locked' }));
            throw e;
        }
    },

    forceLock: async () => {
        try {
            await walletService.closeLock();
        } finally {
            const { timerId } = get();
            if (timerId) window.clearTimeout(timerId);
            set((_s) => ({ status: 'locked', expiresAt: null, timerId: null }));
        }
    },
}));
