// @ts-ignore
import React from 'react';
import { Outlet } from 'react-router-dom';
import { RequiredPassword } from '@main/app/components/RequiredPassword';
import { WindowNavbar } from './WindowNavbar';

export default function AppShell() {
  return (
    <>
      <WindowNavbar />
      <RequiredPassword />
      <Outlet />
    </>
  );
}
