// @ts-ignore
import React, { useEffect, useState } from "react";
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
import { BlockService } from "../../../local_db/wallet/services/blockService";
import { filterByType, groupByDay } from "../../../utils/classifier";
import { transformBlockToTrained } from "../../../utils/transformBlockToTrainedData";
import { CoinService } from "../../../local_db/wallet/services/coinService";
import { getBlockLength, getTokenBlocks } from "../hooks/CoinContext";
import { UserProgressService } from "../../../local_db/wallet/services/userProgressService";
import { Principal } from "@dfinity/principal";

export const History = () => {
  const { wallet } = useWallet();
  const [relevantOperations, setRelevantOperations] =
    useState<GroupByDayInterface>({});
  const [isDetailTransactionOpen, setIsDetailTransactionOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [metadataModal, setMetadataModal] =
    useState<TrainedDataInterface | null>(null);
  const [filter, setFilter] = useState("daily");

  async function fetchingAllTokenBlocks() {
    if (!wallet?.principalId) return;

    const listToken = await CoinService.getAll();

    for (const coin of listToken) {
      const tokenLength = await getBlockLength(
        Principal.fromText(coin.coinAddress)
      );
      console.log("Token Length", tokenLength);

      const progressFetch = await UserProgressService.get(
        wallet.principalId,
        coin.coinArchiveAddress
      );
      const startBlock = progressFetch?.lastSavedBlock ?? 0;

      const result = await getTokenBlocks({
        coinArchiveAddress: Principal.fromText(coin.coinArchiveAddress),
        length: tokenLength,
        start: startBlock,
        wallet: wallet,
      });

      for (const block of result) {
        if (
          block.from === wallet.principalId ||
          block.to === wallet.principalId
        ) {
          await BlockService.add(block);
        } else {
          console.log(`⏩ Skipped non-user block ${block.blockId}`);
        }
      }

      await UserProgressService.saveOrUpdate(
        wallet.principalId,
        coin.coinArchiveAddress,
        tokenLength
      );
    }
  }

  async function loadTransactions() {
    if (!wallet?.principalId) return;

    const blocks = await BlockService.getByPrincipal(wallet.principalId);
    console.log("Fetched blocks:", blocks);

    // 🔁 Konversi dari Block[] ke TrainedDataInterface[]
    const trainedBlocks: TrainedDataInterface[] = blocks.map((block) =>
      transformBlockToTrained(block, wallet.principalId!)
    );

    let filteredBlocks: TrainedDataInterface[] = [];

    if (filter === "daily") {
      setRelevantOperations(groupByDay(trainedBlocks));
    } else if (filter === "received") {
      filteredBlocks = filterByType(
        trainedBlocks,
        wallet.principalId,
        "Received"
      );
      setRelevantOperations(groupByDay(filteredBlocks));
    } else if (filter === "sent") {
      filteredBlocks = filterByType(trainedBlocks, wallet.principalId, "Sent");
      setRelevantOperations(groupByDay(filteredBlocks));
    }
  }

  useEffect(() => {
    async function syncAndLoad() {
      await fetchingAllTokenBlocks(); // 🔁 Fetch & Save ke local DB
      await loadTransactions(); // 📄 Tampilkan dari local DB
    }

    if (wallet?.principalId) {
      syncAndLoad();
    }
  }, [wallet, filter]);

  const handleClick = (op: TrainedDataInterface) => {
    setIsDetailTransactionOpen(true);
    setMetadataModal(op);
  };

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
