// services/draft-service.ts

import {
  readPublishInfo,
  writePreviews,
  writePublishInfo,
  writeStringArray,
} from '../../../lib/helpers/helper-pgl1';
import {
  Category,
  Distribution,
  DraftPGL,
  DraftStatus,
  Manifest,
  MediaItem,
  PublishInfo,
  Tag,
} from '../../../lib/interfaces/game.types';
import { dbGame } from '../database';

/** Util: pastikan draft ada */
function ensureSeed(gameId: string): DraftPGL {
  return {
    pgl1_game_id: gameId,
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
        const metaStatus = readPublishInfo(draft?.pgl1_metadata);
        const currentStatus = metaStatus.isPublished ? 'published' : 'draft';
        return currentStatus === status;
      })
      .toArray();
  },

  /** Upsert draft penuh */
  async upsertFull(payload: DraftPGL & { pgl1_game_id: string }) {
    const prev =
      (await dbGame.game_drafts.get(payload.pgl1_game_id)) ?? ensureSeed(payload.pgl1_game_id);

    const merged: DraftPGL = {
      ...prev,
      ...payload,
      pgl1_game_id: payload.pgl1_game_id,
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
      pgl1_name?: string;
      pgl1_description?: string;
      pgl1_required_age?: number;
      pgl1_price?: number;
      pgl1_website?: string;
      pgl1_cover_vertical_image?: string;
      pgl1_cover_horizontal_image?: string;
      pgl1_banner_image?: string;
      categories?: Category[];
      tags?: Tag[];
    },
  ) {
    const prev = (await dbGame.game_drafts.get(gameId)) ?? ensureSeed(gameId);

    // Merge metadata untuk categories/tags
    let meta = prev.pgl1_metadata;
    if (data.categories !== undefined) {
      meta = writeStringArray(meta, 'pgl1_categories', data.categories);
    }
    if (data.tags !== undefined) {
      meta = writeStringArray(meta, 'pgl1_tags', data.tags);
    }

    const next: DraftPGL = {
      ...prev,
      pgl1_name: data.pgl1_name ?? prev.pgl1_name,
      pgl1_description: data.pgl1_description ?? prev.pgl1_description,
      pgl1_required_age: data.pgl1_required_age ?? prev.pgl1_required_age,
      pgl1_price: data.pgl1_price ?? prev.pgl1_price,
      pgl1_website: data.pgl1_website ?? prev.pgl1_website,
      pgl1_cover_vertical_image: data.pgl1_cover_vertical_image ?? prev.pgl1_cover_vertical_image,
      pgl1_cover_horizontal_image:
        data.pgl1_cover_horizontal_image ?? prev.pgl1_cover_horizontal_image,
      pgl1_banner_image: data.pgl1_banner_image ?? prev.pgl1_banner_image,
      pgl1_metadata: meta,
    };
    return dbGame.game_drafts.put(next);
  },

  // ---------- UPDATE 2: PREVIEWS ----------
  /**
   * Update previews list (array image/video).
   */
  async updatePreviews(gameId: string, previews?: MediaItem[]) {
    const prev = (await dbGame.game_drafts.get(gameId)) ?? ensureSeed(gameId);

    let meta = prev.pgl1_metadata;
    if (previews !== undefined) {
      meta = writePreviews(meta, previews);
    }

    const next: DraftPGL = {
      ...prev,
      pgl1_metadata: meta,
    };
    return dbGame.game_drafts.put(next);
  },

  // ---------- UPDATE 3: BUILDS ----------
  /**
   * Update pgl1_distribution (array of {web}|{native})
   */
  async updateBuilds(gameId: string, newDistributions: Array<Distribution>) {
    const prev = (await dbGame.game_drafts.get(gameId)) ?? ensureSeed(gameId);

    const existingDistributions = prev.pgl1_distribution || [];
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

    const next: DraftPGL = {
      ...prev,
      pgl1_distribution: Array.from(platformMap.values()),
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
    const meta = writePublishInfo(prev.pgl1_metadata, info);

    const next: DraftPGL = {
      ...prev,
      pgl1_metadata: meta,
    };
    return dbGame.game_drafts.put(next);
  },
};
