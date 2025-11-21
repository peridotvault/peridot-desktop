export const HostICP =
    import.meta.env.VITE_NETWORK == 'local'
        ? import.meta.env.VITE_LOCAL_HOST
        : import.meta.env.VITE_HOST;

// ICP
export const ICP_REGISTRY_CANISTER = import.meta.env.VITE_PERIDOT_CANISTER_REGISTRY_BACKEND;
export const ICP_FACTORY_CANISTER = import.meta.env.VITE_PERIDOT_CANISTER_FACTORY_BACKEND;