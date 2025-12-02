
import { create } from "zustand";
import type {
    LibraryEntry,
    LibraryStatus,
} from "@shared/interfaces/library";
import { libraryService } from "../services/localDb";

interface LibraryState {
    entries: LibraryEntry[];
    isLoading: boolean;
    error?: string;

    loadAll: () => Promise<void>;
    getByStatus: (status: LibraryStatus) => LibraryEntry[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
    entries: [],
    isLoading: false,
    error: undefined,

    async loadAll() {
        set({ isLoading: true, error: undefined });
        try {
            const entries = await libraryService.getAll();
            set({ entries, isLoading: false });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load library";
            console.error("[useLibraryStore] loadAll error:", err);
            set({ error: message, isLoading: false });
        }
    },

    getByStatus(status) {
        return get().entries.filter((e) => e.status === status);
    },
}));
