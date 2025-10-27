// idlFactories.ts
import { Actor, HttpAgent, ActorSubclass, HttpAgentOptions, ActorConfig } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

// ✅ Runtime VALUE -> from .js
import { idlFactory as factory_idlFactory } from './canisters/factory.did';
import { idlFactory as registry_idlFactory } from './canisters/registry.did';
import { idlFactory as pgc1_idlFactory } from './canisters/pgc1.did';

// ✅ TYPES ONLY -> from .d.ts (not .d.tsx)
import type { _SERVICE as FactoryService } from './canisters/factory.did.d';
import type { _SERVICE as RegistryService } from './canisters/registry.did.d';
import type { _SERVICE as PGC1Service } from './canisters/pgc1.did.d';
import { ICP_FACTORY_CANISTER, ICP_REGISTRY_CANISTER } from '../../../config/url.const';

// create Actor
interface CreateActorOptions {
    agent?: any;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
}

export const createActorFactory = (
    canisterId: string | Principal = ICP_FACTORY_CANISTER,
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
    canisterId: string | Principal = ICP_REGISTRY_CANISTER,
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

export const createActorPGC1 = (
    canisterId: string | Principal,
    options: CreateActorOptions = {},
): ActorSubclass<PGC1Service> => {
    const agent = options.agent || new HttpAgent({ ...options.agentOptions });

    if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
        agent.fetchRootKey().catch((err: Error) => {
            console.warn('Unable to fetch root key. Is local replica running?');
            console.error(err);
        });
    }

    return Actor.createActor<PGC1Service>(pgc1_idlFactory, {
        agent,
        canisterId,
        ...options.actorOptions,
    });
};
