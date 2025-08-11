// @ts-ignore
import React from "react";
import { shortenAddress } from "../../../utils/Additional";
import { TrainedDataInterface } from "../interfaces/History";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export const HistoryComponent = ({
  user_address,
  transaction_data,
  onClick,
}: {
  user_address: string;
  transaction_data: TrainedDataInterface;
  onClick: () => void;
}) => {
  const E8S_PER_TOKEN = 100000000;
  const isUserSender = transaction_data.sender === user_address ? true : false;
  return (
    <button
      className="flex flex-col gap-4 items-center hover:scale-105 duration-300 group"
      onClick={onClick}
    >
      <div className="w-full flex justify-between gap-4 items-center">
        <div className="flex gap-4 items-center">
          {/* Image  */}
          <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
            <img src="./assets/logo-icp.svg" alt="" className={`w-full p-3`} />
          </div>

          {/* Info  */}
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center gap-2">
              <label className="">{transaction_data.label}</label>
              <span
                className={`text-end w-full text-xs max-w-0 overflow-hidden group-hover:max-w-20 duration-500 ${
                  transaction_data.is_suspicious
                    ? "text-danger"
                    : "text-success"
                }`}
              >
                <FontAwesomeIcon
                  icon={
                    transaction_data.is_suspicious
                      ? faCircleExclamation
                      : faCircleCheck
                  }
                />
              </span>
            </div>
            <span className="text-sm text-text_disabled">
              {isUserSender
                ? "To : " + shortenAddress(transaction_data.receiver, 10, 5)
                : "From : " + shortenAddress(transaction_data.sender, 10, 5)}
            </span>
          </div>
        </div>

        {/* Transaction  */}
        <div className="flex ">
          <p
            className={`${
              isUserSender ? "text-danger" : "text-success"
            }  text-lg`}
          >
            {((isUserSender ? -1 : 1) * transaction_data.value) /
              E8S_PER_TOKEN +
              " " +
              transaction_data.currency}
          </p>
          {/* <span
            className={`text-end w-full text-xs max-h-0 overflow-hidden group-hover:max-h-20 duration-300 ${
              transaction_data.valueCategory === "very_high"
                ? "text-danger"
                : transaction_data.valueCategory === "high"
                ? "text-warning"
                : "text-success"
            }`}
          >
            {transaction_data.valueCategory}
          </span> */}
        </div>
      </div>
    </button>
  );
};
