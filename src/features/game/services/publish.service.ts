import { ICPPrivateAgent } from '@shared/blockchain/icp/sdk/actors';
import { createActorPGC1, createActorRegistry } from '@shared/blockchain/icp/sdk/agents';
import type { Result as PgcResult } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';
import type { ApiResponse_1 } from '@shared/blockchain/icp/sdk/canisters/registry.did.d';
import { walletService } from '@shared/services/wallet.service';

interface PublishOnChainOptions {
  gameId: string;
  metadataURI: string;
  name?: string;
  description?: string;
  published?: boolean;
  wallet: any;
}

const unwrapRegistry = (label: string, response: ApiResponse_1) => {
  if ('err' in response) {
    const [code, message] = Object.entries(response.err)[0] as [string, string];
    throw new Error(`${label} failed: ${code} ${message ?? ''}`.trim());
  }
  return response.ok;
};

const assertPgcOk = (label: string, result: PgcResult) => {
  if ('err' in result) {
    throw new Error(`${label} failed: ${result.err}`);
  }
};

export const publishGameOnChain = async ({
  gameId,
  metadataURI,
  name,
  description,
  published = true,
  wallet,
}: PublishOnChainOptions): Promise<void> => {
  if (!wallet?.encryptedPrivateKey) {
    throw new Error('Active wallet is required to publish on-chain.');
  }

  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const agent = ICPPrivateAgent({ privateKey });

  const registry = createActorRegistry(undefined, { agent });
  const record = unwrapRegistry('Get game record', await registry.getGameRecordById(gameId));

  const pgcActor = createActorPGC1(record.canister_id, { agent });

  if (name?.trim()) {
    assertPgcOk('Update name', await pgcActor.setName(name.trim()));
  }

  if (description?.trim()) {
    assertPgcOk('Update description', await pgcActor.setDescription(description.trim()));
  }

  if (metadataURI.trim()) {
    assertPgcOk('Update metadata URI', await pgcActor.setMetadataURI(metadataURI.trim()));
  }

  assertPgcOk('Update published flag', await pgcActor.setPublished(!!published));
};
