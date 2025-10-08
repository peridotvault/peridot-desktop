// idlFactories.ts
import { Actor, HttpAgent, ActorSubclass, HttpAgentOptions, ActorConfig } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

// ✅ Runtime VALUE -> dari .js
import { idlFactory as directory_idlFactory } from './directory/service';
import { idlFactory as factory_idlFactory } from './factory/service';
import { idlFactory as vault_idlFactory } from './vault/service';
import { idlFactory as registry_idlFactory } from './registry/service';
import { idlFactory as pgl1_idlFactory } from './pgl1/service';

// ✅ TYPES ONLY -> dari .d.ts (bukan .d.tsx)
import type { _SERVICE as DirectoryService } from './directory/service.did.d';
import type { _SERVICE as FactoryService } from './factory/service.did.d';
import type { _SERVICE as RegistryService } from './registry/service.did.d';
import type { _SERVICE as VaultService } from './vault/service.did.d';
import type { _SERVICE as PGL1Service } from './pgl1/service.did.d';

const directoryCanister = import.meta.env.VITE_PERIDOT_CANISTER_DIRECTORY_BACKEND;
const factoryCanister = import.meta.env.VITE_PERIDOT_CANISTER_FACTORY_BACKEND;
const registryCanister = import.meta.env.VITE_PERIDOT_CANISTER_REGISTRY_BACKEND;
const vaultCanister = import.meta.env.VITE_PERIDOT_CANISTER_VAULT_BACKEND;

// create Actor
interface CreateActorOptions {
  agent?: any;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
}

export const createActorDirectory = (
  canisterId: string | Principal = directoryCanister,
  options: CreateActorOptions = {},
): ActorSubclass<DirectoryService> => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch((err: Error) => {
      console.warn('Unable to fetch root key. Is local replica running?');
      console.error(err);
    });
  }

  return Actor.createActor<DirectoryService>(directory_idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const createActorFactory = (
  canisterId: string | Principal = factoryCanister,
  options: CreateActorOptions = {},
): ActorSubclass<FactoryService> => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch((err: Error) => {
      console.warn('Unable to fetch root key. Is local replica running?');
      console.error(err);
    });
  }

  return Actor.createActor<FactoryService>(factory_idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const createActorRegistry = (
  canisterId: string | Principal = registryCanister,
  options: CreateActorOptions = {},
): ActorSubclass<RegistryService> => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch((err: Error) => {
      console.warn('Unable to fetch root key. Is local replica running?');
      console.error(err);
    });
  }

  return Actor.createActor<RegistryService>(registry_idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const createActorVault = (
  canisterId: string | Principal = vaultCanister,
  options: CreateActorOptions = {},
): ActorSubclass<VaultService> => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch((err: Error) => {
      console.warn('Unable to fetch root key. Is local replica running?');
      console.error(err);
    });
  }

  return Actor.createActor<VaultService>(vault_idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const createActorPGL1 = (
  canisterId: string | Principal,
  options: CreateActorOptions = {},
): ActorSubclass<PGL1Service> => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch((err: Error) => {
      console.warn('Unable to fetch root key. Is local replica running?');
      console.error(err);
    });
  }

  return Actor.createActor<PGL1Service>(pgl1_idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};
