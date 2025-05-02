// @ts-ignore
import React from "react";
import { TrainedDataInterface } from "../interfaces/History";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { shortenAddress } from "../../../utils/Additional";
import { ButtonTransaction } from "../../../components/atoms/ButtonComponent";
import { ipcRenderer } from "electron";

export const TransactionProof = ({
  parseMetadata,
  onCloseModal,
}: {
  parseMetadata: TrainedDataInterface;
  onCloseModal: () => void;
}) => {
  const E8S_PER_TOKEN = 100000000;
  const isReceived = parseMetadata.value > 0 ? true : false;
  const metadata = [
    {
      title: "Hash",
      content: shortenAddress(parseMetadata.transaction_identifier, 10, 10),
    },
    {
      title: "Type",
      content: receivedComponent(isReceived),
    },
    {
      title: "Index",
      content: parseMetadata.index,
    },
    {
      title: "Amount",
      content:
        ((isReceived ? 1 : -1) * parseMetadata.value) / E8S_PER_TOKEN +
        " " +
        parseMetadata.currency,
    },
    {
      title: isReceived ? "From" : "To",
      content: shortenAddress(
        isReceived ? parseMetadata.sender : parseMetadata.receiver,
        10,
        10
      ),
    },
    {
      title: "Timestamp",
      content: parseMetadata.date,
    },
  ];

  function receivedComponent(isReceived: boolean) {
    return (
      <div className="flex">
        <p className="bg-accent_primary px-3 text-sm rounded-full text-black">
          {isReceived ? "Received" : "Sent"}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 bg-background_primary w-full h-full flex flex-col p-8 gap-12 justify-between">
      {/* header  */}
      <header className="flex justify-between items-center">
        <button onClick={onCloseModal} className="w-6 aspect-square">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1 className="text-xl">Transaction</h1>
        <div className="w-6 aspect-square"></div>
      </header>

      {/* Content  */}
      <div className="flex flex-col">
        <table className="rounded-xl overflow-hidden shadow-flat-sm">
          <tbody>
            {metadata.map((item, index) => (
              <tr
                key={index}
                className={`${
                  metadata.length - 1 == index ? "" : "border-b"
                } border-background_disabled`}
              >
                <td className="pl-6 py-6 text-text_disabled">{item.title}</td>
                <td className="pr-6 py-6">{item.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ButtonTransaction
        text="View On Explorer"
        onClick={() => {
          ipcRenderer.send(
            "open-external-link",
            `https://www.icpexplorer.org/#/tx/${parseMetadata.transaction_identifier}`
          );
        }}
      />
    </div>
  );
};
