// @ts-ignore
import React from "react";
import { TrainedDataInterface } from "../interfaces/History";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { shortenAddress } from "../../../utils/Additional";
import { ButtonTransaction } from "../../../components/atoms/ButtonTransaction";
import { ipcRenderer } from "electron";
import { DateTime } from "luxon";

export function millisecondsToTimestamp(milliseconds: number): string {
  return DateTime.fromMillis(milliseconds / 1_000_000)
    .toUTC()
    .toFormat("yyyy-MM-dd, h:mm:ss a 'UTC'");
}

export const TransactionProof = ({
  user_address,
  parseMetadata,
  onCloseModal,
}: {
  user_address: string;
  parseMetadata: TrainedDataInterface;
  onCloseModal: () => void;
}) => {
  const E8S_PER_TOKEN = 100000000;
  const isUserSender = parseMetadata.sender === user_address ? true : false;
  const metadata = [
    {
      title: "Block Id",
      content: parseMetadata.index,
    },
    {
      title: "Type",
      content: receivedComponent(isUserSender),
    },
    {
      title: "Amount",
      content:
        ((isUserSender ? -1 : 1) * parseMetadata.value) / E8S_PER_TOKEN +
        " " +
        parseMetadata.currency,
    },
    {
      title: isUserSender ? "To" : "From",
      content: shortenAddress(
        isUserSender ? parseMetadata.receiver : parseMetadata.sender,
        10,
        10
      ),
    },
    {
      title: "Timestamp",
      content: millisecondsToTimestamp(Number(parseMetadata.timestamp)),
    },
  ];

  function receivedComponent(isUserSender: boolean) {
    return (
      <div className="flex">
        <p className="bg-accent_primary px-3 text-sm rounded-full text-black">
          {isUserSender ? "Sent" : "Received"}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed right-0 w-[370px] top-0 bg-background_primary h-full flex flex-col p-8 gap-12 justify-between">
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
            `https://peridot-explorer.vercel.app/${parseMetadata.canisterId}/transaction/${parseMetadata.transaction_identifier}`
          );
        }}
      />
    </div>
  );
};
