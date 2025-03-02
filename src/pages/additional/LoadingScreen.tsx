// @ts-ignore
import React from "react";

export const LoadingScreen = () => {
  return (
    <main className="w-full absolute h-full justify-center flex items-center bg-background_primary/50 z-50 backdrop-blur-sm">
      <img
        src="./assets/logo-peridot.svg"
        className="w-12 h-12 animate-bounce object-contain"
        alt=""
      />
    </main>
  );
};
