// utils/classifier.ts

import { TrainedDataInterface } from '@features/wallet/interfaces/History';

export function groupByDay(data: TrainedDataInterface[]) {
  // 1) Grouping seperti biasa
  const grouped: Record<string, TrainedDataInterface[]> = {};
  data.forEach((item) => {
    const date = new Date(Number(item.timestamp) / 1_000_000).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  // 2) Convert ke array, urutkan dari terbaru
  const sortedEntries = Object.entries(grouped).sort(
    ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime(),
  );

  // 3) Balikin dalam bentuk array atau object tergantung kebutuhan
  return Object.fromEntries(sortedEntries);
}

export function filterByType(
  data: TrainedDataInterface[],
  principal: string,
  type: 'Received' | 'Sent',
) {
  return data.filter((tx) =>
    type === 'Received' ? tx.receiver === principal : tx.sender === principal,
  );
}
