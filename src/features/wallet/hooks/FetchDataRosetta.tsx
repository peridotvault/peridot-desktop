import {
  RawTransactionsResponse,
  RelevantOperation,
  TrainedDataInterface,
  GroupByDayInterface,
} from "../interfaces/History";
import { RosettaApi } from "../services/api/RosettaApi";
import DecisionTree from "decision-tree";
import { DateTime } from "luxon";
import __ from "lodash";

// Fungsi utama
export async function fetchDataRosetta(
  accountId: string
): Promise<TrainedDataInterface[]> {
  const api = new RosettaApi();
  const rawTransactions: RawTransactionsResponse =
    await api.getTransactionsByAccount(accountId);
  const relevantOperations: RelevantOperation[] = [];

  rawTransactions.transactions.forEach((tx) => {
    const { transaction_identifier, operations, metadata } = tx.transaction;

    const senderOp = operations.find(
      (op) => op.type === "TRANSACTION" && op.amount.value.startsWith("-")
    );

    const receiverOp = operations.find(
      (op) =>
        (op.type === "TRANSACTION" && op.amount.value.startsWith("+")) ||
        !op.amount.value.startsWith("-")
    );

    if (!senderOp || !receiverOp) return;

    if (
      senderOp.account.address === accountId ||
      receiverOp.account.address === accountId
    ) {
      relevantOperations.push({
        index: tx.block_identifier.index,
        transaction_identifier: transaction_identifier.hash,
        value: parseInt(
          senderOp.account.address === accountId
            ? senderOp.amount.value
            : receiverOp.amount.value
        ),
        timestamp: metadata.timestamp,
        currency: senderOp.amount.currency.symbol,
        sender: senderOp.account.address,
        receiver: receiverOp.account.address,
      });
    }
  });

  const trainedData = trainDataDecisionTree(relevantOperations, accountId);
  return trainedData;
}

// Training + labeling
function trainDataDecisionTree(
  relevantOperations: RelevantOperation[],
  accountId: string
): TrainedDataInterface[] {
  const trainingData = [
    { value: 1000000, isSender: false, label: "Received" },
    { value: -1000000, isSender: true, label: "Sent" },
    { value: 500000, isSender: false, label: "Received" },
    { value: -500000, isSender: true, label: "Sent" },
    { value: -10000, isSender: true, label: "Sent" },
    { value: -10000, isSender: false, label: "Received" },
    { value: 10000, isSender: false, label: "Received" },
    { value: 10000, isSender: true, label: "Sent" },
  ];

  const class_name = "label";
  const features = ["value", "isSender"];
  const dt = new DecisionTree(trainingData, class_name, features);

  const values = relevantOperations.map((op) => Math.abs(op.value));
  const mean = calculateMean(values);
  const std = calculateStd(values, mean);

  // Hitung threshold adaptif
  const adaptiveThreshold = Math.max(1.5, std / mean);

  const enriched = relevantOperations.map((op) => {
    const isSender = op.sender === accountId;
    const label: string = dt.predict({ value: op.value, isSender });
    const date: string = millisecondsToDateTime(
      Number(op.timestamp)
    ).toString();
    const zScore = (Math.abs(op.value) - mean) / std;

    // Gunakan threshold adaptif
    const is_suspicious = Math.abs(zScore) > adaptiveThreshold;

    const valueCategory = dynamicValueCategory(Math.abs(op.value), mean, std);

    return {
      ...op,
      label,
      date,
      isSender,
      is_suspicious,
      valueCategory,
      zScore: zScore.toFixed(2),
      adaptiveThreshold: adaptiveThreshold.toFixed(2),
    };
  });

  return enriched;
}

// Hitung rata-rata
function calculateMean(values: number[]): number {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

// Hitung standar deviasi
function calculateStd(values: number[], mean: number): number {
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

// Kategori berdasarkan distribusi pengguna
function dynamicValueCategory(
  value: number,
  mean: number,
  std: number
): string {
  if (value > mean + 2 * std) return "very_high";
  if (value > mean + std) return "high";
  if (value < mean - std) return "low";
  return "medium";
}

// Convert timestamp
function millisecondsToDateTime(milliseconds: number): Date {
  return DateTime.fromMillis(milliseconds / 1_000_000).toISODate();
}

export function millisecondsToTimestamp(milliseconds: number): string {
  return DateTime.fromMillis(milliseconds / 1_000_000)
    .toUTC()
    .toFormat("yyyy-MM-dd, h:mm:ss a 'UTC'");
}

export async function classifiedByDay(
  classified: TrainedDataInterface[]
): Promise<GroupByDayInterface> {
  return __.groupBy(classified, "date");
}

export async function classifiedByReceived(
  classified: TrainedDataInterface[],
  label: string
): Promise<GroupByDayInterface> {
  return __.groupBy(
    classified.filter((tx) => tx.label === label),
    "date"
  );
}
