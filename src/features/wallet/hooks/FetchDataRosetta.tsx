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

export async function fetchDataRosetta(
  accountId: string
): Promise<GroupByDayInterface> {
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

    if (!senderOp || !receiverOp) {
      return;
    }

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

  const trainedData = trainDataDecisionTree(relevantOperations);
  const classifiedData = classifiedByDay(await trainedData);
  return classifiedData;
}

async function trainDataDecisionTree(
  relevantOperations: RelevantOperation[]
): Promise<TrainedDataInterface[]> {
  const trainingData = [
    { value: 1000000, label: "Received" },
    { value: -1000000, label: "Sent" },
    { value: 500000, label: "Received" },
    { value: -500000, label: "Sent" },
  ];

  const class_name = "label";
  const features = ["value"];

  const dt = new DecisionTree(trainingData, class_name, features);
  const classified = relevantOperations.map((op) => {
    const label: string = dt.predict({ value: op.value });
    const date: string = millisecondsToDateTime(
      Number(op.timestamp)
    ).toString();

    return {
      ...op,
      label,
      date,
    };
  });
  return classified;
}

function millisecondsToDateTime(milliseconds: number): Date {
  return DateTime.fromMillis(milliseconds / 1_000_000).toISODate();
}

// function millisecondsToDateTime(milliseconds: number): string {
//   return DateTime
//     .fromMillis(milliseconds / 1_000_000)
//     .toUTC()
//     .toFormat("yyyy-MM-dd, h:mm:ss a 'UTC'");
// }

async function classifiedByDay(
  classified: TrainedDataInterface[]
): Promise<GroupByDayInterface> {
  const result = __.groupBy(classified, "date");
  return result;
}
