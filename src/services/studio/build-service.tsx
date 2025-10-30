import { isNativeBuild, isWebBuild } from '../../lib/helpers/helper-pgl1';
import type { Platform, ViewMode } from '@shared/blockchain/icp/types/game.types';
import type { Distribution, Opt } from '../../lib/interfaces/game.types';
import { DraftService } from '../../local-db/game/services/draft-services';

type WebBuildForm = {
  url: string;
  processor: string;
  graphics: string;
  memory: string;
  storage: string;
  additionalNotes?: string;
};

type HardwareForm = {
  processor: string;
  graphics: string;
  memory: string;
  storage: string;
  additionalNotes: string;
};

const toOpt = <T,>(value: T | undefined | null): Opt<T> =>
  value === undefined || value === null ? [] : [value];

export const BuildService = {
  async setLiveVersion(gameId: string, platform: Platform, version: string) {
    const draft = await DraftService.get(gameId);
    if (!draft?.pgl1_distribution || !draft.pgl1_game_id) return;

    const updated = draft.pgl1_distribution.map((dist): Distribution => {
      if (isNativeBuild(dist) && dist.native.os === platform) {
        return { native: { ...dist.native, liveVersion: version } };
      }
      return dist;
    });

    await DraftService.upsertFull({
      ...draft,
      pgl1_game_id: draft.pgl1_game_id,
      pgl1_distribution: updated,
    });
  },

  async saveWebBuild(gameId: string, webBuildForm: WebBuildForm) {
    const draft = await DraftService.get(gameId);
    if (!draft?.pgl1_game_id) return;

    // Filter out existing web build
    const filtered = (draft.pgl1_distribution ?? []).filter(
      (dist: Distribution) => !isWebBuild(dist),
    );
    const updated: Distribution[] = [
      ...filtered,
      {
        web: {
          url: webBuildForm.url,
          processor: webBuildForm.processor,
          graphics: webBuildForm.graphics,
          memory: Number(webBuildForm.memory) || 0,
          storage: Number(webBuildForm.storage) || 0,
          additionalNotes: toOpt(
            webBuildForm.additionalNotes?.trim()
              ? webBuildForm.additionalNotes.trim()
              : undefined,
          ),
        },
      },
    ];

    await DraftService.upsertFull({
      ...draft,
      pgl1_game_id: draft.pgl1_game_id,
      pgl1_distribution: updated,
    });
  },

  async handleSaveNativeHardware(
    gameId: string,
    viewMode: ViewMode,
    hardwareForms: Record<Platform, HardwareForm>,
  ) {
    if (viewMode === 'live' || viewMode === 'web') return;

    const draft = await DraftService.get(gameId!);
    if (!draft?.pgl1_game_id) return;

    const currentForm = hardwareForms[viewMode];

    const updatedDistributions =
      (draft.pgl1_distribution ?? []).map((dist: Distribution): Distribution => {
        if (isNativeBuild(dist) && dist.native.os === viewMode) {
          return {
            native: {
              ...dist.native,
              processor: currentForm.processor,
              graphics: currentForm.graphics,
              memory: Number(currentForm.memory) || 0,
              storage: Number(currentForm.storage) || 0,
              additionalNotes: toOpt(
                currentForm.additionalNotes.trim() ? currentForm.additionalNotes.trim() : undefined,
              ),
            },
          };
        }
        return dist;
      }) || [];

    await DraftService.upsertFull({
      ...draft,
      pgl1_game_id: draft.pgl1_game_id,
      pgl1_distribution: updatedDistributions,
    });
  },
};
