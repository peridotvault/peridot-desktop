import { HttpAgent } from '@dfinity/agent';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { hexToArrayBuffer } from '../../../utils/crypto';
import { HostICP } from '../../../constants/url.const';

export const ICPPublicAgent = new HttpAgent({
    host: HostICP,
});

if (import.meta.env.VITE_DFX_NETWORK !== 'ic') {
    void ICPPublicAgent.fetchRootKey().catch((err: Error) => {
        console.warn('Unable to fetch root key for public agent. Is local replica running?');
        console.error(err);
    });
}

export const ICPPrivateAgent = ({ privateKey }: { privateKey: string }): HttpAgent => {
    const secretKey = hexToArrayBuffer(privateKey);
    return new HttpAgent({
        host: HostICP,
        identity: Secp256k1KeyIdentity.fromSecretKey(new Uint8Array(secretKey)),
    });
};
