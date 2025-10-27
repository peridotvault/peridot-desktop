import { HttpAgent } from "@dfinity/agent";
import { hexToArrayBuffer } from "../../../utils/crypto";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { HostICP } from "../../../config/url.const";

export const ICPPublicAgent = new HttpAgent({
    host: HostICP,
});

export const ICPPrivateAgent = async ({ privateKey }: { privateKey: string }) => {
    const secretKey = hexToArrayBuffer(privateKey);
    const agent = new HttpAgent({
        host: HostICP,
        identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    return agent;
}