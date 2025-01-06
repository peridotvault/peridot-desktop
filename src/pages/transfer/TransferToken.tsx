// @ts-ignore
import React, { useState } from "react";
// import { Actor, HttpAgent } from "@dfinity/agent";
// import { icrc1IdlFactory } from "../../hooks/idl/icrc1";
// import { Principal } from "@dfinity/principal";

interface metadata {
  decimals: number;
  name: string;
  symbol: string;
  fee: number;
}

export default function TransferToken({
  args,
  balance,
}: {
  args: metadata;
  balance: string;
}) {
  const [toPrincipalId, setToPrincipalId] = useState("");
  const [amount, setAmount] = useState(0);

  // async function transfer(toPrincipalId: string, amount: number) {
  //   const agent = new HttpAgent({
  //     host: "https://ic0.app",
  //     // identity: this.identity
  //   });
  //   // await agent.fetchRootKey(); // Important for local development

  //   const ledgerActor = Actor.createActor(icrc1IdlFactory, {
  //     agent,
  //     canisterId: "4u7dm-7qaaa-aaaam-acvdq-cai",
  //   });

  //   // Convert amount to e8s (smallest unit)
  //   const amountInE8s = BigInt(Math.floor(amount * args.decimals));

  //   const transferRecord = {
  //     to: {
  //       owner: Principal.fromText(toPrincipalId),
  //       subaccount: [],
  //     },
  //     fee: [args.fee],
  //     memo: [],
  //     from_subaccount: [],
  //     created_at_time: [],
  //     amount: amountInE8s,
  //   };

  //   try {
  //     const result = await ledgerActor.icrc1_transfer(transferRecord);
  //     return {
  //       success: true,
  //       result: result,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: (error as Error).message,
  //     };
  //   }
  // }

  return (
    <div>
      <p>TransferToken</p>
      <div className="flex items-center gap-3">
        <div className="w-12 aspect-square bg-white rounded-full"></div>
        <div className="">
          <p>{args.name}</p>
          <p className="text-xs">{balance + " " + args.symbol}</p>
        </div>
      </div>

      <input
        type="text"
        value={toPrincipalId}
        onChange={(e) => {
          setToPrincipalId(e.target.value);
        }}
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => {
          setAmount(Number(e.target.value));
        }}
      />

      <button>Send</button>
    </div>
  );
}
