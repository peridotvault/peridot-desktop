import { isNativeBuild, isWebBuild } from '../../lib/helpers/helper-pgl1';
import { Hardware, Platform, ViewMode, WebBuild } from '../../lib/interfaces/game.types';
import { DraftService } from '../../local-db/game/services/draft-services';

export const BuildService = {
  async setLiveVersion(gameId: string, platform: Platform, version: string) {
    const draft = await DraftService.get(gameId);
    if (!draft?.pgl1_distribution || !draft.pgl1_game_id) return;

    const updated = draft.pgl1_distribution.map((dist) => {
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

  async saveWebBuild(gameId: string, webBuildForm: WebBuild) {
    const draft = await DraftService.get(gameId);
    if (!draft?.pgl1_game_id) return;

    // Filter out existing web build
    const filtered = draft.pgl1_distribution?.filter((dist) => !isWebBuild(dist)) || [];
    const updated = [...filtered, { web: webBuildForm }];

    await DraftService.upsertFull({
      ...draft,
      pgl1_game_id: draft.pgl1_game_id,
      pgl1_distribution: updated,
    });
  },

  async handleSaveNativeHardware(
    gameId: string,
    viewMode: ViewMode,
    hardwareForms: Record<Platform, Hardware>,
  ) {
    if (viewMode === 'live' || viewMode === 'web') return;

    const draft = await DraftService.get(gameId!);
    if (!draft?.pgl1_game_id) return;

    const currentForm = hardwareForms[viewMode];

    const updatedDistributions =
      draft.pgl1_distribution?.map((dist) => {
        if (isNativeBuild(dist) && dist.native.os === viewMode) {
          return {
            native: {
              ...dist.native,
              processor: currentForm.processor,
              graphics: currentForm.graphics,
              memory: parseInt(currentForm.memory) || 0,
              storage: parseInt(currentForm.storage) || 0,
              additionalNotes: currentForm.additionalNotes,
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
