import type { PurchaseType } from '../service.did.d';

export async function buyGame(_payload: {
    gameId: string;
    wallet: any;
}): Promise<PurchaseType> {
    throw new Error('Purchasing is not supported yet in the new smart-contract API.');
}
