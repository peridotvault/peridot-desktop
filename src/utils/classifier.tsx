// utils/classifier.ts

import { TrainedDataInterface } from "../features/wallet/interfaces/History";

export function groupByDay(data: TrainedDataInterface[]) {
  const grouped: Record<string, TrainedDataInterface[]> = {};
  data.forEach((item) => {
    const date = new Date(
      Number(item.timestamp) / 1_000_000
    ).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });
  return grouped;
}

export function filterByType(
  data: TrainedDataInterface[],
  principal: string,
  type: "Received" | "Sent"
) {
  return data.filter((tx) =>
    type === "Received" ? tx.receiver === principal : tx.sender === principal
  );
}
