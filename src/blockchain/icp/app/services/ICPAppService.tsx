import { Actor, HttpAgent } from '@dfinity/agent';
import {
  AppInterface,
  CreateAppInterface,
  UpdateAppInterface,
} from '../../../../interfaces/app/AppInterface';
import { ICPAppFactory } from '../ICPAppFactory';
import { walletService } from '../../../../features/wallet/services/WalletService';
import { hexToArrayBuffer } from '../../../../utils/crypto';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { ApiResponse } from '../../../../interfaces/CoreInterface';

const appCanister = import.meta.env.VITE_PERIDOT_CANISTER_APP_BACKEND;

export async function createApp({
  createAppTypes,
  wallet,
}: {
  createAppTypes: CreateAppInterface;
  wallet: any;
}): Promise<AppInterface> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });
    const result = (await actor.createApp(createAppTypes)) as ApiResponse<AppInterface>;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`createApp failed: ${k} - ${v}`);
    }
    console.log('done');

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Create App : ' + error);
  }
}

export async function updateApp({
  updateAppTypes,
  appId,
  wallet,
}: {
  updateAppTypes: UpdateAppInterface;
  appId: number;
  wallet: any;
}): Promise<AppInterface> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });
    console.log('trying');
    const result = (await actor.updateApp(
      updateAppTypes,
      BigInt(appId),
    )) as ApiResponse<AppInterface>;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`updateApp failed: ${k} - ${v}`);
    }
    console.log('done');

    return result.ok;
  } catch (error) {
    throw new Error('Error Service Update App : ' + error);
  }
}

export async function getAppByDeveloperId({
  wallet,
}: {
  wallet: any;
}): Promise<AppInterface[] | null> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = (await actor.getAppByDeveloperId()) as ApiResponse<AppInterface[]>;
    console.log(result);
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getAllApps failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get All Apps by Developer Id : ' + error);
  }
}

export async function getAllApps(): Promise<AppInterface[] | null> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = (await actor.getAllApps()) as ApiResponse<AppInterface[]>;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getAllApps failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get All Apps : ' + error);
  }
}

export async function getAllPublishApps(): Promise<AppInterface[] | null> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = (await actor.getAllPublishApps()) as ApiResponse<AppInterface[]>;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getAllApps failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get All Apps : ' + error);
  }
}

export async function getAppById({ appId }: { appId: number }): Promise<AppInterface | null> {
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = (await actor.getAppById(BigInt(appId))) as ApiResponse<AppInterface>;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getAppById failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get App By Id : ' + error);
  }
}

export async function getMyApps({ wallet }: { wallet: any }): Promise<AppInterface[] | null> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = (await actor.getMyApps()) as ApiResponse<AppInterface[]>;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`getMyApps failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Get My Apps : ' + error);
  }
}

export async function deleteApp({ wallet, appId }: { wallet: any; appId: number }): Promise<Text> {
  const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey);
  const secretKey = hexToArrayBuffer(privateKey);
  try {
    // Initialize agent with identity
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });

    const actor = Actor.createActor(ICPAppFactory, {
      agent,
      canisterId: appCanister,
    });

    const result = (await actor.deleteApp(appId)) as ApiResponse<Text>;
    if ('err' in result) {
      const [k, v] = Object.entries(result.err)[0] as [string, string];
      throw new Error(`deleteApp failed: ${k} - ${v}`);
    }
    return result.ok;
  } catch (error) {
    throw new Error('Error Service Delete App : ' + error);
  }
}
