// @ts-ignore
import React, { useEffect, useState } from "react";
import {
  classifiedByDay,
  classifiedByReceived,
  fetchDataRosetta,
} from "../hooks/FetchDataRosetta";
import { useWallet } from "../../../contexts/WalletContext";
import {
  GroupByDayInterface,
  TrainedDataInterface,
} from "../interfaces/History";
import { HistoryComponent } from "../components/HistoryComponent";
import { TransactionProof } from "./TransactionProof";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FilterHistory } from "../components/FilterHistory";

export const History = () => {
  const { wallet } = useWallet();
  const [relevantOperations, setRelevantOperations] =
    useState<GroupByDayInterface>({});
  const [isDetailTransactionOpen, setIsDetailTransactionOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [metadataModal, setMetadataModal] =
    useState<TrainedDataInterface | null>(null);
  const [filter, setFilter] = useState("daily");

  useEffect(() => {
    async function fetchingData() {
      if (wallet?.accountId) {
        const data = await fetchDataRosetta(wallet.accountId);
        setRelevantOperations(await classifiedByDay(data));
      }
    }
    fetchingData();
  }, [wallet]);

  useEffect(() => {
    handleChangeFilter();
  }, [filter]);

  async function handleChangeFilter() {
    if (wallet?.accountId) {
      const data = await fetchDataRosetta(wallet.accountId);
      if (filter == "daily") {
        setRelevantOperations(await classifiedByDay(data));
      } else if (filter == "received") {
        setRelevantOperations(await classifiedByReceived(data, "Received"));
      } else if (filter == "sent") {
        setRelevantOperations(await classifiedByReceived(data, "Sent"));
      }
    }
  }

  function handleClick(op: TrainedDataInterface) {
    setIsDetailTransactionOpen(true);
    setMetadataModal(op);
  }

  function handleCloseModal() {
    setIsDetailTransactionOpen(false);
    setMetadataModal(null);
  }

  function handleOpenFilter() {
    setIsFilterOpen(true);
  }

  return (
    <div
      className={`p-8 flex flex-col gap-8 h-full relative ${
        isFilterOpen ? "overflow-hidden" : "overflow-auto"
      }`}
    >
      {/* Header  */}
      <header className="flex items-center justify-between">
        <div className="w-12"></div>
        <h1 className="text-center text-xl">Recent Activity</h1>
        <button
          className="bg-background_primary shadow-arise-sm hover:shadow-flat-sm w-12 h-12 flex justify-center items-center rounded-xl duration-300 opacity-80 hover:opacity-100"
          onClick={handleOpenFilter}
        >
          <FontAwesomeIcon icon={faFilter} className="text-md" />
        </button>
      </header>

      {/* contents */}
      <section className="flex flex-col gap-8">
        {Object.entries(relevantOperations).map(([date, transactions]) => (
          <div key={date} className="flex flex-col gap-6">
            <h2>{date}</h2>
            {transactions.map((tx, idx) => (
              <HistoryComponent
                key={idx}
                transaction_data={tx}
                onClick={() => handleClick(tx)}
              />
            ))}
          </div>
        ))}
      </section>

      {/* Modal ✅ */}
      {/* Detail Transaction */}
      {isFilterOpen ? (
        <FilterHistory
          onCloseModal={() => setIsFilterOpen(false)}
          filter={filter}
          setFilter={setFilter}
        />
      ) : (
        ""
      )}

      {/* Detail Transaction */}
      {isDetailTransactionOpen ? (
        <TransactionProof
          parseMetadata={metadataModal!}
          onCloseModal={handleCloseModal}
        />
      ) : (
        ""
      )}
    </div>
  );
};
