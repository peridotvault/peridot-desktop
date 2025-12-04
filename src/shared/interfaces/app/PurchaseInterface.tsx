import { AppId, Timestamp, UserId } from '../CoreInterface';

/** =========================
 *  Purchase
 *  ========================= */
export interface PurchaseInterface {
  userId: UserId;
  appId: AppId;
  amount: bigint;
  purchasedAt: Timestamp;
  txIndex?: bigint;
  memo?: Blob;
}
