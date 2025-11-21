// @ts-ignore
import React, { lazy, Suspense } from 'react';

import { createHashRouter } from 'react-router-dom';

// EAGER (tetap biasa)
import UpdaterPage from '@pages/additional/UpdaterPage';
import AppShell from './layouts/app-shell';
import VaultPage from '@pages/vault';
import { LoadingScreen } from '@components/organisms/LoadingScreen';
import { StudioGameMedia } from '@pages/studio/game/media';
import { StudioGameBuilds } from '@pages/studio/game/build';
import { StudioGameMarket } from '@pages/studio/game/market';
import { StudioGameNewBuild } from '@pages/studio/game/build/create';
import StudioGamePublish from '@pages/studio/game/publish';
import MainLayout from '@pages/_layouts/Main';

// LAZY (split)
const LibraryLayout = lazy(() => import('@pages/library/_components/layouts/Main'));
const LibraryPage = lazy(() => import('@pages/library'));
const LibraryGameDetail = lazy(() => import('@pages/library/game-detail'));
const Market = lazy(() => import('@pages/market'));
const DownloadPage = lazy(() => import('@pages/download-page'));
const GameDetail = lazy(() => import('@pages/vault/game-detail'));
const ProfileUser = lazy(() => import('@pages/user'));
const ProfileDeveloper = lazy(() => import('@pages/profile/ProfileDeveloper'));
const EditUser = lazy(() => import('@pages/user/edit'));
const StudioMainLayout = lazy(() => import('@pages/studio/_components/_layouts/Main'));
const StudioDashboard = lazy(() => import('@pages/studio'));
const StudioGames = lazy(() => import('@pages/studio/game'));
const StudioGameLayout = lazy(() => import('@pages/studio/game/_components/layouts/main'));
const StudioGameDetails = lazy(() => import('@pages/studio/game/general'));
const StudioGameAnnouncement = lazy(() => import('@pages/studio/game/announcement'));
const StudioTeamPage = lazy(() => import('@pages/studio/team'));
const NotFound = lazy(() => import('@pages/not-found'));

const withSuspense = (el: React.ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{el}</Suspense>
);

const router = createHashRouter([
  {
    path: '/updater',
    element: <UpdaterPage />,
  },

  {
    path: '/',
    element: <AppShell />, // ⬅️ wrapper global
    children: [
      // home
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <VaultPage />,
          },
          {
            path: 'library',
            element: withSuspense(<LibraryLayout />),
            children: [
              {
                index: true,
                element: withSuspense(<LibraryPage />),
              },
              {
                path: ':appName/:gameId',
                element: withSuspense(<LibraryGameDetail />),
              },
            ],
          },
          {
            path: 'market',
            element: withSuspense(<Market />),
          },
          {
            path: 'download',
            element: withSuspense(<DownloadPage />),
          },
          {
            path: 'vault/:gameName/:gameId',
            element: withSuspense(<GameDetail />),
          },
          // profile
          {
            path: 'profile',
            element: withSuspense(<ProfileUser />),
          },
          {
            path: 'profile-developer',
            element: withSuspense(<ProfileDeveloper />),
          },
          {
            path: 'update-profile',
            element: withSuspense(<EditUser />),
          },
        ],
      },

      // Studio
      {
        path: 'studio',
        element: withSuspense(<StudioMainLayout />),
        children: [
          {
            index: true,
            element: withSuspense(<StudioDashboard />),
          },
          {
            path: 'dashboard',
            element: withSuspense(<StudioDashboard />),
          },
          {
            path: 'game',
            element: withSuspense(<StudioGames />),
          },
          {
            path: 'game/:gameId',
            element: withSuspense(<StudioGameLayout />),
            children: [
              {
                index: true,
                element: withSuspense(<StudioGameDetails />),
              },
              {
                path: 'details',
                element: withSuspense(<StudioGameDetails />),
              },
              {
                path: 'media',
                element: withSuspense(<StudioGameMedia />),
              },
              {
                path: 'builds',
                element: withSuspense(<StudioGameBuilds />),
              },
              {
                path: 'builds/new',
                element: <StudioGameNewBuild />,
              },
              {
                path: 'market',
                element: withSuspense(<StudioGameMarket />),
              },
              {
                path: 'publish',
                element: withSuspense(<StudioGamePublish />),
              },
              {
                path: 'announcements',
                element: withSuspense(<StudioGameAnnouncement />),
              },
            ],
          },
          {
            path: 'team',
            element: withSuspense(<StudioTeamPage />),
          },
        ],
      },
    ],
  },

  {
    path: '/*',
    element: <NotFound />,
  },
]);

export default router;
