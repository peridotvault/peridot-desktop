import { Actor, HttpAgent } from "@dfinity/agent";
import { AnnouncementInterface, CreateAnnouncementInterface } from "../../../../interfaces/announcement/AnnouncementInterface";
import { walletService } from "../../../../features/wallet/services/WalletService";
import { hexToArrayBuffer } from "../../../../utils/crypto";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { ICPAnnouncementFactory } from "../ICPAppFactory";
import { ApiResponse } from "../../../../interfaces/CoreInterface";

const appCanister = import.meta.env.VITE_PERIDOT_CANISTER_APP_BACKEND;

export async function createAnnouncement({ createAnnouncementTypes, wallet, appId }: { createAnnouncementTypes: CreateAnnouncementInterface; wallet: any; appId: any }): Promise<AnnouncementInterface> {
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
    const secretKey = hexToArrayBuffer(privateKey);

    try {
        const agent = new HttpAgent({
            host: import.meta.env.VITE_HOST,
            identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
        });

        const actor = Actor.createActor(ICPAnnouncementFactory, {
            agent,
            canisterId: appCanister,
        });

        const result = (await actor.createAnnouncement(appId, createAnnouncementTypes)) as ApiResponse<AnnouncementInterface>;

        if ("err" in result) {
            const [k, v] = Object.entries(result.err)[0] as [string, string];
            throw new Error(`createAnnouncement failed: ${k} - ${v}`);
        }

        return result.ok;
    } catch (error) {
        throw new Error("Error Service Create Announcement:" + error);
    }
}

export async function getAllAnnouncementsByAppId({ appId, wallet }: { appId: any; wallet: any }): Promise<AnnouncementInterface[] | null> {
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
    const secretKey = hexToArrayBuffer(privateKey);

    try {
        const agent = new HttpAgent({
            host: import.meta.env.VITE_HOST,
            identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
        });

        const actor = Actor.createActor(ICPAnnouncementFactory, {
            agent,
            canisterId: appCanister,
        });

        const result = (await actor.getAllAnnouncementsByAppId(appId)) as ApiResponse<AnnouncementInterface[]>;
        console.log("Announcements: " + result);
        if ("err" in result) {
            const [k, v] = Object.entries(result.err)[0] as [string, string];
            throw new Error(`getAllApps failed: ${k} - ${v}`);
        }

        return result.ok;
    } catch (error) {
        throw new Error("Error Service Get All Announcements by App Id: " + error);
    }
}

export async function likeByAnnouncementId({ announcementId, wallet }: { announcementId: any; wallet: any }) {
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
    const secretKey = hexToArrayBuffer(privateKey);

    try {
        const agent = new HttpAgent({
            host: import.meta.env.VITE_HOST,
            identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
        });

        const actor = Actor.createActor(ICPAnnouncementFactory, {
            agent,
            canisterId: appCanister,
        });

        const result = (await actor.likeByAnnouncementId(announcementId)) as ApiResponse<AnnouncementInterface>;
        if ("err" in result) {
            const [k, v] = Object.entries(result.err)[0] as [string, string];
            throw new Error(`getAllApps failed: ${k} - ${v}`);
        }

        return result.ok;
    } catch (error) {
        throw new Error("Error Service Like by Announcement ID: " + error);
    }
}
