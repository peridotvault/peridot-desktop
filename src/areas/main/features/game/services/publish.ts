import { ICPPrivateAgent } from '@shared/blockchain/icp/sdk/actors';
import { createActorPGC1, createActorRegistry } from '@shared/blockchain/icp/sdk/agents';
import type { Result as PgcResult } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';
import type { ApiResponse_1 } from '@shared/blockchain/icp/sdk/canisters/registry.did.d';
import { walletService } from '@shared/services/wallet';
import type { Manifest, Platform, StorageRef } from '@shared/blockchain/icp/types/game.types';
import type { StorageRef as PgcStorageRef } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';

interface PublishOnChainOptions {
  gameId: string;
  metadataURI: string;
  name?: string;
  description?: string;
  published?: boolean;
  hardware?: HardwareUpdatePayload[];
  liveVersions?: LiveVersionPayload[];
  manifests?: PublishManifestPayload[];
  wallet: any;
}

export interface HardwareUpdatePayload {
  platform: Platform;
  processor?: string;
  graphics?: string;
  memoryMB?: number;
  storageMB?: number;
  additionalNotes?: string;
}

export interface LiveVersionPayload {
  platform: Platform;
  version: string | number | bigint;
}

export interface PublishManifestPayload {
  platform: Platform;
  manifest: Manifest;
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

const toPlatformVariant = (platform: Platform) => {
  switch (platform) {
    case 'windows':
      return { windows: null } as const;
    case 'macos':
      return { macos: null } as const;
    case 'linux':
      return { linux: null } as const;
    case 'android':
      return { android: null } as const;
    case 'ios':
      return { ios: null } as const;
    case 'other':
      return { other: null } as const;
    case 'web':
    default:
      return { web: null } as const;
  }
};

const toNat32 = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) return 0;
  const bounded = Math.max(0, Math.min(0xffffffff, Math.round(value)));
  return bounded;
};

const toNat64 = (value: string | number | bigint): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('Live version number must be a positive finite value.');
    }
    return BigInt(Math.trunc(value));
  }
  const cleaned = value.trim();
  if (!/^\d+$/.test(cleaned)) {
    throw new Error(
      `Live version "${value}" must be numeric to be accepted on-chain. Please ensure you append builds using numeric versions.`,
    );
  }
  return BigInt(cleaned);
};

const normalizeStorageRef = (storage?: StorageRef | PgcStorageRef): PgcStorageRef => {
  if (!storage) {
    throw new Error('Manifest storage reference is required to append builds on-chain.');
  }
  if ('s3' in storage) {
    return {
      s3: {
        bucket: storage.s3.bucket,
        basePath: storage.s3.basePath,
      },
    };
  }
  if ('url' in storage) {
    return {
      url: {
        url: storage.url.url,
      },
    };
  }
  if ('ipfs' in storage) {
    return {
      ipfs: {
        cid: storage.ipfs.cid,
        path: storage.ipfs.path ?? '',
      },
    };
  }
  return storage;
};

const normalizeChecksum = (value?: string | number[] | Uint8Array): number[] => {
  if (!value) return [];
  if (typeof value === 'string') {
    let hex = value.trim();
    if (!hex) return [];
    if (hex.startsWith('0x') || hex.startsWith('0X')) {
      hex = hex.slice(2);
    }
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`;
    }
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.slice(i, i + 2), 16);
      if (Number.isNaN(byte)) {
        return [];
      }
      bytes.push(byte);
    }
    return bytes;
  }
  if (value instanceof Uint8Array) {
    return Array.from(value);
  }
  return Array.isArray(value) ? value : [];
};

const ensureChecksum32 = (bytes: number[]): number[] => {
  if (bytes.length === 32) return bytes;
  if (bytes.length === 0) {
    return Array(32).fill(0);
  }
  if (bytes.length > 32) {
    return bytes.slice(0, 32);
  }
  const padded = Array.from(bytes);
  while (padded.length < 32) {
    padded.push(0);
  }
  return padded;
};

const manifestIdentity = (manifest: Manifest): string => {
  const version = `${manifest.version ?? ''}`.trim().toLowerCase();
  if (version) return version;
  const listing = `${manifest.listing ?? ''}`.trim().toLowerCase();
  if (listing) return listing;
  const storage = (manifest.storageRef ?? (manifest as any).storage) as StorageRef | undefined;
  if (storage) {
    if ('url' in storage) {
      return storage.url.url.trim().toLowerCase();
    }
    if ('s3' in storage) {
      return `${storage.s3.bucket}/${storage.s3.basePath}`.trim().toLowerCase();
    }
    if ('ipfs' in storage) {
      return `${storage.ipfs.cid}/${storage.ipfs.path ?? ''}`.trim().toLowerCase();
    }
  }
  return JSON.stringify(manifest ?? {}).toLowerCase();
};

const normalizeManifestForAppend = (manifest: Manifest) => {
  const version =
    (manifest.version ?? manifest.listing ?? '').toString().trim() ||
    new Date().toISOString();
  const sizeValue =
    manifest.sizeBytes ?? manifest.size_bytes ?? (manifest as any).sizeBytes ?? 0;
  const createdValue =
    manifest.createdAt ?? (manifest as any).created_at ?? Date.now();
  const storageRef = normalizeStorageRef(
    manifest.storageRef ?? (manifest as any).storage ?? (manifest as any).storageRef,
  );
  const checksumBytes = ensureChecksum32(normalizeChecksum(manifest.checksum));

  const sizeBigInt =
    typeof sizeValue === 'bigint'
      ? sizeValue
      : BigInt(Math.max(0, Number(sizeValue) || 0));
  const createdBigInt =
    typeof createdValue === 'bigint'
      ? createdValue
      : BigInt(Math.max(0, Number(createdValue) || Date.now()));

  return {
    version,
    size: sizeBigInt,
    checksum: checksumBytes,
    createdAt: createdBigInt,
    storageRef,
    identity: manifestIdentity(manifest),
  };
};

const appendManifestsOnChain = async ({
  manifests,
  actor,
}: {
  manifests: PublishManifestPayload[];
  actor: ReturnType<typeof createActorPGC1>;
}) => {
  if (!manifests.length) return;

  const platformCache = new Map<Platform, Set<string>>();

  const ensureCache = async (platform: Platform): Promise<Set<string>> => {
    if (platformCache.has(platform)) {
      return platformCache.get(platform)!;
    }
    const existing =
      (await actor.getAllManifests(toPlatformVariant(platform))) ?? [];
    const ids = new Set(
      existing.map((manifest: any) => manifestIdentity(manifest as Manifest)),
    );
    platformCache.set(platform, ids);
    return ids;
  };

  for (const entry of manifests) {
    const normalized = normalizeManifestForAppend(entry.manifest);
    const cache = await ensureCache(entry.platform);
    if (cache.has(normalized.identity)) {
      continue;
    }

    const checksumVec =
      normalized.checksum.length > 0
        ? Array.from(normalized.checksum)
        : [];

    assertPgcOk(
      `Append build (${entry.platform})`,
      await actor.appendBuild(
        toPlatformVariant(entry.platform),
        normalized.version,
        normalized.size,
        checksumVec,
        normalized.createdAt,
        normalized.storageRef,
      ),
    );

    cache.add(normalized.identity);
  }
};

export const publishGameOnChain = async ({
  gameId,
  metadataURI,
  name,
  description,
  published = true,
  hardware,
  liveVersions,
  manifests,
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

  if (Array.isArray(manifests) && manifests.length) {
    await appendManifestsOnChain({ manifests, actor: pgcActor });
  }

  if (Array.isArray(hardware) && hardware.length) {
    for (const config of hardware) {
      const platformVariant = toPlatformVariant(config.platform);
      assertPgcOk(
        `Update hardware (${config.platform})`,
        await pgcActor.setHardware(
          platformVariant,
          config.processor ?? '',
          config.graphics ?? '',
          toNat32(config.memoryMB),
          toNat32(config.storageMB),
          config.additionalNotes ?? '',
        ),
      );
    }
  }

  if (Array.isArray(liveVersions) && liveVersions.length) {
    for (const live of liveVersions) {
      const platformVariant = toPlatformVariant(live.platform);
      const versionNat = toNat64(live.version);
      assertPgcOk(
        `Set live version (${live.platform})`,
        await pgcActor.setLiveVersion(platformVariant, versionNat),
      );
    }
  }

  assertPgcOk('Update published flag', await pgcActor.setPublished(!!published));
};
