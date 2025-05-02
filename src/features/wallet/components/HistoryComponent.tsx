// @ts-ignore
import React from "react";
import { shortenAddress } from "../../../utils/Additional";

export const HistoryComponent = ({
  value,
  currency,
  sender,
  receiver,
  onClick,
}: {
  value: number;
  currency: string;
  sender: string;
  receiver: string;
  onClick: () => void;
}) => {
  const E8S_PER_TOKEN = 100000000;
  const isReceived = value > 0 ? true : false;
  return (
    <button
      className="flex justify-between gap-4 items-center rounded-2xl hover:scale-105 duration-300"
      onClick={onClick}
    >
      <div className="flex gap-4 items-center">
        {/* Image  */}
        <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
          <img src="./assets/logo-icp.svg" alt="" className={`w-full p-3`} />
        </div>

        {/* Info  */}
        <div className="flex flex-col items-start justify-center">
          <label className="">{isReceived ? "Received" : "Sent"}</label>
          <span className="text-sm text-text_disabled">
            {isReceived
              ? "From : " + shortenAddress(sender, 10, 5)
              : "To : " + shortenAddress(receiver, 10, 5)}
          </span>
        </div>
      </div>

      {/* Transaction  */}
      <p className={`${value > 0 ? "text-success" : "text-danger"}  text-lg`}>
        {((isReceived ? 1 : -1) * value) / E8S_PER_TOKEN + " " + currency}
      </p>
    </button>
  );
};
