import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { WalletProvider } from "./contexts/WalletContext";
import { Buffer } from "buffer";
import Lenis from "lenis";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

// Initialize Lenis smooth scrolling
const lenis = new Lenis();

function raf(time: any) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Create a root wrapper component
const Root = () => {
  return <RouterProvider router={router} />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <Root />
    </WalletProvider>
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
