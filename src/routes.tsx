// @ts-ignore
import React from 'react';

import { createHashRouter } from 'react-router-dom';

import Login from './pages/signin/Login';
import CreateWallet from './pages/signin/CreateWallet';
import ImportWallet from './pages/signin/ImportWallet';
import VaultPage from './pages/VaultPage';
import MainLayout from './layouts/MainLayout';
import GameDetailLibrary from './pages/library/GameDetailLibrary';
import GameDetail from './pages/game_detail/GameDetail';
import LibraryMainLayout from './layouts/library/LibraryMainLayout';
import { Library } from './pages/library/Library';
import { Market } from './pages/market/Market';
import { CreateProfile } from './pages/profile/CreateProfile';
import { UpdateProfile } from './pages/profile/UpdateProfile';
import { ProfileUser } from './pages/profile/ProfileUser';
import { ProfileDeveloper } from './pages/profile/ProfileDeveloper';
import { CreateDeveloper } from './pages/studio/CreateDeveloper';
import { StudioMainLayout } from './layouts/studio/StudioMainLayout';
import { NotFound } from './pages/NotFound';
import { DeveloperStudio } from './pages/studio/DeveloperStudio';
import UpdateApp from './pages/studio/UpdateApp';
import { DownloadPage } from './pages/DownloadPage';

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
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <VaultPage />,
      },
      {
        path: 'library',
        element: <LibraryMainLayout />,
        children: [
          {
            index: true,
            element: <Library />,
          },
          {
            path: ':appName/:appId',
            element: <GameDetailLibrary />,
          },
        ],
      },
      {
        path: 'market',
        element: <Market />,
      },
      {
        path: 'download',
        element: <DownloadPage />,
      },
      {
        path: ':app_name/:appId',
        element: <GameDetail />,
      },
      // profile
      {
        path: 'profile_user',
        element: <ProfileUser />,
      },
      {
        path: 'profile_developer',
        element: <ProfileDeveloper />,
      },
      {
        path: 'update_profile',
        element: <UpdateProfile />,
      },
      // Developer
      {
        path: 'create_developer',
        element: <CreateDeveloper />,
      },
      {
        path: 'studio',
        element: <StudioMainLayout />,
        children: [
          {
            index: true,
            element: <DeveloperStudio />,
          },
          {
            path: 'update/:appId',
            element: <UpdateApp />,
          },
        ],
      },
    ],
  },

  // signin
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/create_wallet',
    element: <CreateWallet />,
  },
  {
    path: '/import_wallet',
    element: <ImportWallet />,
  },
  {
    path: '/create_profile',
    element: <CreateProfile />,
  },
  {
    path: '/*',
    element: <NotFound />,
  },
]);

export default router;
