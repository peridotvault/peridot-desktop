// @ts-ignore
import React, { lazy, Suspense } from 'react';

import { createHashRouter } from 'react-router-dom';

// EAGER (tetap biasa)
import UpdaterPage from './pages/additional/UpdaterPage';
import AppShell from './layouts/app-shell';
import MainLayout from './layouts/_main_/main-layout';
import VaultPage from './pages/Vault';
import { LoadingScreen } from './components/organisms/LoadingScreen';
import { StudioGameMedia } from './pages/studio/game/studio-game-media';
import { StudioGameBuilds } from './pages/studio/game/studio-game-builds';
import { StudioGameMarket } from './pages/studio/game/studio-game-market';
import { StudioGameNewBuild } from './pages/studio/game/studio-game-newbuild';
import StudioGamePublish from './pages/studio/game/studio-game-publish';

// LAZY (split)
const LibraryLayout = lazy(() => import('./layouts/library/library-layout'));
const LibraryPage = lazy(() => import('./pages/library/Library'));
const LibraryGameDetail = lazy(() => import('./pages/library/library-game-detail'));
const Market = lazy(() => import('./pages/market/Market'));
const DownloadPage = lazy(() => import('./pages/download-page'));
const GameDetail = lazy(() => import('./pages/game_detail/GameDetail'));
const ProfileUser = lazy(() => import('./pages/profile/profile-user'));
const ProfileDeveloper = lazy(() => import('./pages/profile/ProfileDeveloper'));
const UpdateProfile = lazy(() => import('./pages/profile/update-user'));
const CreateDeveloper = lazy(() => import('./pages/studio/CreateDeveloper'));
const StudioLayout = lazy(() => import('./layouts/studio/studio-layout'));
const StudioDashboard = lazy(() => import('./pages/studio/studio-dashboard'));
const StudioGames = lazy(() => import('./pages/studio/studio-games'));
const StudioGameLayout = lazy(() => import('./layouts/studio/game/studio-game-layout'));
const StudioGameDetails = lazy(() => import('./pages/studio/game/studio-game-details'));
const StudioGameAnnouncement = lazy(() => import('./pages/studio/game/studio-game-announcements'));
const StudioTeamPage = lazy(() => import('./pages/studio/studio-team'));
const NotFound = lazy(() => import('./pages/additional/NotFound'));

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
            element: withSuspense(<UpdateProfile />),
          },
          // Developer
          {
            path: 'create-developer',
            element: withSuspense(<CreateDeveloper />),
          },
        ],
      },

      // Studio
      {
        path: 'studio',
        element: withSuspense(<StudioLayout />),
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
