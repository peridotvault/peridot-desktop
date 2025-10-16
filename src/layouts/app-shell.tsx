// @ts-ignore
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RequiredPassword } from '../components/organisms/required-password';

export default function AppShell() {
  // (Opsional) Kalau mau sembunyikan overlay di halaman login:
  const { pathname } = useLocation();
  const hideOverlay = pathname.startsWith('/login');

  return (
    <>
      {!hideOverlay && <RequiredPassword />}
      <Outlet />
    </>
  );
}
