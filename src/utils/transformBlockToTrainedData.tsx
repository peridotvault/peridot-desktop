import { Block } from '../local-db/wallet/models/Block';
import { TrainedDataInterface } from '../features/wallet/interfaces/History';

export function transformBlockToTrained(block: Block, principalId: string): TrainedDataInterface {
  const isSender = block.from === principalId;

  return {
    index: Number(block.blockId),
    date: new Date(Number(block.timestamp) / 1_000_000).toLocaleDateString(),
    label: block.op,
    transaction_identifier: `${block.blockId}`,
    canisterId: block.coinArchiveAddress,
    value: block.amt,
    timestamp: String(block.timestamp),
    currency: '', // kamu bisa ambil dari coin.symbol jika mau
    sender: block.from,
    receiver: block.to,
    isSender,
    is_suspicious: false,
    valueCategory: '', // bisa diisi berdasarkan aturan nanti
  };
}
