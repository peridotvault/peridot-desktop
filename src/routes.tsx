// @ts-ignore
import React from "react";

import { createHashRouter } from "react-router-dom";

import Login from "./pages/signin/Login";
import CreateWallet from "./pages/signin/CreateWallet";
import ImportWallet from "./pages/signin/ImportWallet";
import VaultPage from "./pages/VaultPage";
import MainLayout from "./components/layout/MainLayout";
import GameDetailLibrary from "./pages/library/GameDetailLibrary";
import GameDetail from "./pages/game_detail/GameDetail";
import LibraryMainLayout from "./components/layout/library/LibraryMainLayout";
import { Library } from "./pages/library/Library";

// import React, { lazy, Suspense } from "react";
// const Login = lazy(() => import("./pages/signin/Login"));
// const CreateWallet = lazy(() => import("./pages/signin/CreateWallet"));
// const ImportWallet = lazy(() => import("./pages/signin/ImportWallet"));
// const Home = lazy(() => import("./pages/Home"));
// const MainLayout = lazy(() => import("./components/layout/MainLayout"));
// const Library = lazy(() => import("./pages/Library"));
// const GameDetail = lazy(() => import("./pages/game_detail/GameDetail"));

const router = createHashRouter([
  // home
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <VaultPage />,
      },
      {
        path: "library",
        element: <LibraryMainLayout />,
        children: [
          {
            index: true,
            element: <Library />,
          },
          {
            path: ":game",
            element: <GameDetailLibrary />,
          },
        ],
      },
      {
        path: ":game",
        element: <GameDetail />,
      },
    ],
  },

  // signin
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create_wallet",
    element: <CreateWallet />,
  },
  {
    path: "/import_wallet",
    element: <ImportWallet />,
  },
]);

export default router;
