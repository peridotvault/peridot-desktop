// @ts-ignore
import React from "react";

export const TransactionSuccess = ({ msg }: { msg: string }) => {
  return (
    <div className="bg-black/40 absolute w-full h-full left-0 top-0 flex flex-col justify-end z-50">
      <div className="bg-background_primary px-10 py-20 rounded-t-2xl flex flex-col items-center gap-5">
        <img src="./assets/logo-peridot.svg" className="w-1/5" alt="" />
        <p className="text-lg font-semibold">{msg}</p>
      </div>
    </div>
  );
};
