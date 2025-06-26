// @ts-ignore
import React, { useState } from "react";

export const FilterHistory = ({
  filter,
  setFilter,
  onCloseModal,
}: {
  filter: string;
  setFilter: (v: string) => void;
  onCloseModal: () => void;
}) => {
  const options = [
    { value: "daily", label: "Daily" },
    { value: "received", label: "Received" },
    { value: "sent", label: "Sent" },
  ];

  return (
    <div
      className="absolute bottom-0 left-0 bg-black/30 w-full h-screen flex flex-col justify-end"
      onClick={onCloseModal}
    >
      <div
        className="bg-background_primary flex flex-col p-8 gap-8 rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header  */}
        <h3 className="text-center text-xl">Filter History</h3>
        {/* content  */}
        <section className="flex flex-col gap-4">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-6 py-4 rounded-lg transition-all shadow-flat-sm
              ${
                filter === option.value
                  ? "shadow-sunken-sm"
                  : "hover:shadow-arise-sm "
              }
              `}
            >
              {option.label}
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};
