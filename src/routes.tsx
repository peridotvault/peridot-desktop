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
import { Market } from "./pages/market/Market";
import { CreateProfile } from "./pages/profile/CreateProfile";
import { UpdateProfile } from "./pages/profile/UpdateProfile";
import { ProfileUser } from "./pages/profile/ProfileUser";
import { ProfileDeveloper } from "./pages/profile/ProfileDeveloper";
import { CreateDeveloper } from "./pages/developer/CreateDeveloper";
import { CreateApp } from "./pages/developer/CreateApp";
import { StudioMainLayout } from "./components/layout/studio/StudioMainLayout";
import { NotFound } from "./pages/NotFound";

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
        path: "market",
        element: <Market />,
      },
      {
        path: ":app_name/:app_id",
        element: <GameDetail />,
      },
      // profile
      {
        path: "profile_user",
        element: <ProfileUser />,
      },
      {
        path: "profile_developer",
        element: <ProfileDeveloper />,
      },
      {
        path: "update_profile",
        element: <UpdateProfile />,
      },
      // Developer
      {
        path: "create_developer",
        element: <CreateDeveloper />,
      },
      {
        path: "studio",
        element: <StudioMainLayout />,
        children: [
          {
            index: true,
            element: <CreateApp />,
          },
          {
            path: "create",
            element: <CreateApp />,
          },
        ],
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
  {
    path: "/create_profile",
    element: <CreateProfile />,
  },
  {
    path: "/*",
    element: <NotFound />,
  },
]);

export default router;
