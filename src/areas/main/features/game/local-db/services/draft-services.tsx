// services/draft-service.ts

import {
  Category,
  Distribution,
  DraftPGC,
  DraftStatus,
  Manifest,
  MediaItem,
  PublishInfo,
  Tag,
} from '@shared/interfaces/game.types';
import { dbGame } from '../database';

/** Util: pastikan draft ada */
function ensureSeed(gameId: string): DraftPGC {
  return {
    gameId,
    distribution: [],
    previews: [],
    categories: [],
    tags: [],
    publishInfo: { isPublished: false },
  };
}

export const DraftService = {
  /** Ambil satu draft berdasarkan game_id */
  async get(gameId: string) {
    return dbGame.game_drafts.get(gameId);
  },

  /** Hapus draft */
  async remove(gameId: string) {
    return dbGame.game_drafts.delete(gameId);
  },

  /** Dapatkan semua draft dengan status tertentu */
  async list(status: DraftStatus = 'draft') {
    return dbGame.game_drafts
      .filter((draft) => {
        const currentStatus = draft?.publishInfo?.isPublished ? 'published' : 'draft';
        return currentStatus === status;
      })
      .toArray();
  },

  /** Upsert draft penuh */
  async upsertFull(payload: DraftPGC & { gameId: string }) {
    const prev = (await dbGame.game_drafts.get(payload.gameId)) ?? ensureSeed(payload.gameId);

    const merged: DraftPGC = {
      ...prev,
      ...payload,
      gameId: payload.gameId,
    };
    return dbGame.game_drafts.put(merged);
  },

  // ---------- UPDATE 1: GENERAL ----------
  /**
   * Update informasi umum + categories/tags (metadata).
   */
  async updateGeneral(
    gameId: string,
    data: {
      name?: string;
      description?: string;
      requiredAge?: number;
      price?: number;
      website?: string;
      coverVerticalImage?: string;
      coverHorizontalImage?: string;
      bannerImage?: string;
      categories?: Category[];
      tags?: Tag[];
    },
  ) {
    const prev = (await dbGame.game_drafts.get(gameId)) ?? ensureSeed(gameId);

    const next: DraftPGC = {
      ...prev,
      name: data.name ?? prev.name,
      description: data.description ?? prev.description,
      requiredAge: data.requiredAge ?? prev.requiredAge,
      price: data.price ?? prev.price,
      website: data.website ?? prev.website,
      coverVerticalImage: data.coverVerticalImage ?? prev.coverVerticalImage,
      coverHorizontalImage: data.coverHorizontalImage ?? prev.coverHorizontalImage,
      bannerImage: data.bannerImage ?? prev.bannerImage,
      categories: data.categories ?? prev.categories,
      tags: data.tags ?? prev.tags,
    };
    return dbGame.game_drafts.put(next);
  },

  // ---------- UPDATE 2: PREVIEWS ----------
  /**
   * Update previews list (array image/video).
   */
  async updatePreviews(gameId: string, previews?: MediaItem[]) {
    const prev = (await dbGame.game_drafts.get(gameId)) ?? ensureSeed(gameId);

    const next: DraftPGC = {
      ...prev,
      previews: previews ?? [],
    };
    return dbGame.game_drafts.put(next);
  },

  // ---------- UPDATE 3: BUILDS ----------
  /**
   * Update distribution (array of {web}|{native})
   */
  async updateBuilds(gameId: string, newDistributions: Array<Distribution>) {
    const prev = (await dbGame.game_drafts.get(gameId)) ?? ensureSeed(gameId);

    const existingDistributions = prev.distribution || [];
    const platformMap = new Map<string, Distribution>();

    // Load existing distributions
    for (const dist of existingDistributions) {
      const key = 'web' in dist ? 'web' : dist.native.os;
      platformMap.set(key, dist);
    }

    // Merge new distributions
    for (const newDist of newDistributions) {
      const key = 'web' in newDist ? 'web' : newDist.native.os;

      if (platformMap.has(key)) {
        const existingDist = platformMap.get(key)!;

        if ('web' in newDist) {
          // Web: replace seluruhnya
          platformMap.set(key, newDist);
        } else if ('native' in newDist) {
          if ('native' in existingDist) {
            // Native: merge manifests dengan deduplikasi versi
            const allManifests = [...existingDist.native.manifests, ...newDist.native.manifests];

            // Keep versi terbaru untuk setiap version string
            const versionMap = new Map<string, Manifest>();
            for (const manifest of allManifests) {
              versionMap.set(manifest.version, manifest);
            }

            // ✅ Pertahankan liveVersion yang sudah ada
            const liveVersion = existingDist.native.liveVersion;

            platformMap.set(key, {
              native: {
                ...newDist.native,
                manifests: Array.from(versionMap.values()),
                liveVersion, // ✅ Pertahankan liveVersion
              },
            });
          } else {
            // Replace jika tipe berbeda
            platformMap.set(key, newDist);
          }
        }
      } else {
        // Platform baru
        platformMap.set(key, newDist);
      }
    }

    const next: DraftPGC = {
      ...prev,
      distribution: Array.from(platformMap.values()),
    };
    return dbGame.game_drafts.put(next);
  },

  // ---------- PUBLISH ----------
  /**
   * Tandai draft sebagai published di metadata.
   * Catatan: Ini hanya update draft, bukan deploy ke chain!
   */
  async markPublished(
    gameId: string,
    info: PublishInfo = { isPublished: true, releaseDate: Date.now() },
  ) {
    const prev = (await dbGame.game_drafts.get(gameId)) ?? ensureSeed(gameId);

    const next: DraftPGC = {
      ...prev,
      publishInfo: info,
    };
    return dbGame.game_drafts.put(next);
  },
};
