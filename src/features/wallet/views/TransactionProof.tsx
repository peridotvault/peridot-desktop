// @ts-ignore
import React from 'react';
import { TrainedDataInterface } from '../interfaces/History';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { shortenAddress } from '@shared/utils/Additional';
import { DateTime } from 'luxon';
import { openUrl } from '@tauri-apps/plugin-opener';
import { ButtonTransaction } from '@shared/components/atoms/ButtonTransaction';

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
      title: 'Block Id',
      content: parseMetadata.index,
    },
    {
      title: 'Type',
      content: receivedComponent(isUserSender),
    },
    {
      title: 'Amount',
      content:
        ((isUserSender ? -1 : 1) * parseMetadata.value) / E8S_PER_TOKEN +
        ' ' +
        parseMetadata.currency,
    },
    {
      title: isUserSender ? 'To' : 'From',
      content: shortenAddress(isUserSender ? parseMetadata.receiver : parseMetadata.sender, 10, 10),
    },
    {
      title: 'Timestamp',
      content: millisecondsToTimestamp(Number(parseMetadata.timestamp)),
    },
  ];

  function receivedComponent(isUserSender: boolean) {
    return (
      <div className="flex">
        <p className="bg-accent-foreground px-3 text-sm rounded-full text-black">
          {isUserSender ? 'Sent' : 'Received'}
        </p>
      </div>
    );
  }

  const explorerUrl = `https://peridot-explorer.vercel.app/${parseMetadata.canisterId}/transaction/${parseMetadata.transaction_identifier}`;

  const openExplorer = async () => {
    try {
      if ((window as any).__TAURI__) {
        await openUrl(explorerUrl);
      } else {
        window.open(explorerUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to open explorer', error);
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed left-20 w-[370px] top-0 bg-background h-full flex flex-col p-8 gap-12 justify-between">
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
                  metadata.length - 1 == index ? '' : 'border-b'
                } border-muted-foreground`}
              >
                <td className="pl-6 py-6 text-muted-foreground">{item.title}</td>
                <td className="pr-6 py-6">{item.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ButtonTransaction text="View On Explorer" onClick={openExplorer} />
    </div>
  );
};
