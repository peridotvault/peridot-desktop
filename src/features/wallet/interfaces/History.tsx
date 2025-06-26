interface Operation {
  account: {
    address: string;
  };
  type: string;
  amount: {
    value: string;
    currency: {
      symbol: string;
    };
  };
}

interface Transaction {
  transaction_identifier: {
    hash: string;
  };
  operations: Operation[];
  metadata: {
    timestamp: string;
  };
}

interface RawTransaction {
  block_identifier: {
    index: number;
  };
  transaction: Transaction;
}

export interface RawTransactionsResponse {
  transactions: RawTransaction[];
}

export interface RelevantOperation {
  index: number;
  transaction_identifier: string;
  value: number;
  timestamp: string;
  currency: string;
  sender: string;
  receiver: string;
}

export interface TrainedDataInterface {
  index: number;
  date: string;
  label: string;
  transaction_identifier: string;
  value: number;
  timestamp: string;
  currency: string;
  sender: string;
  receiver: string;
  isSender: boolean;
  is_suspicious: boolean;
  valueCategory: string;
}

export interface GroupByDayInterface {
  [date: string]: TrainedDataInterface[];
}
