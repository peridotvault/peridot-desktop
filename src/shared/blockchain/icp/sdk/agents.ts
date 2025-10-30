// idlFactories.ts
import { Actor, HttpAgent, ActorSubclass, HttpAgentOptions, ActorConfig } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

// ✅ Runtime VALUE -> from .js
import { idlFactory as factory_idlFactory } from './canisters/factory.did';
import { idlFactory as registry_idlFactory } from './canisters/registry.did';
import { idlFactory as pgc1_idlFactory } from './canisters/pgc1.did';

// ✅ TYPES ONLY -> from generated .d.ts files
import type { _SERVICE as FactoryService } from './canisters/factory.did.d';
import type { _SERVICE as RegistryService } from './canisters/registry.did.d';
import type { _SERVICE as PGC1Service } from './canisters/pgc1.did.d';
import { ICP_FACTORY_CANISTER, ICP_REGISTRY_CANISTER } from '../../../constants/url.const';

// create Actor
interface CreateActorOptions {
    agent?: HttpAgent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
}

const getAgent = (agent: HttpAgent | undefined, agentOptions?: HttpAgentOptions): HttpAgent => {
    if (agent) {
        return agent;
    }

    const newAgent = new HttpAgent({ ...agentOptions });

    if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
        void newAgent.fetchRootKey().catch((err: Error) => {
            console.warn('Unable to fetch root key. Is local replica running?');
            console.error(err);
        });
    }

    return newAgent;
};

export const createActorFactory = (
    canisterId: string | Principal = ICP_FACTORY_CANISTER,
    options: CreateActorOptions = {},
): ActorSubclass<FactoryService> => {
    const agent = getAgent(options.agent, options.agentOptions);

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
    const agent = getAgent(options.agent, options.agentOptions);

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
    const agent = getAgent(options.agent, options.agentOptions);

    return Actor.createActor<PGC1Service>(pgc1_idlFactory, {
        agent,
        canisterId,
        ...options.actorOptions,
    });
};
