// @ts-ignore
import React from "react";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const AlertMessage = ({
  msg,
  isSuccess,
}: {
  msg: string;
  isSuccess: boolean;
}) => {
  return (
    <div className="fixed left-0 top-0 p-4 z-50">
      <div className="bg-background_primary p-6 rounded-b-2xl rounded-tr-2xl flex flex-col gap-1 max-w-[350px]">
        <div className="flex items-center gap-3 text-lg">
          <div
            className={`w-8 rounded-full flex items-center justify-center aspect-square ${
              isSuccess ? "bg-success" : "bg-danger"
            }`}
          >
            <FontAwesomeIcon icon={isSuccess ? faCheck : faXmark} />
          </div>
          <p
            className={`font-semibold ${
              isSuccess ? "text-success" : "text-danger"
            }`}
          >
            {isSuccess ? "Success" : "Failed"}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 flex-shrink-0"></div>
          <p className="text-white/70">{msg}</p>
        </div>
      </div>
    </div>
  );
};
