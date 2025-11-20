// @ts-ignore
import React from 'react';
import { Outlet } from 'react-router-dom';
import { RequiredPassword } from '../components/organisms/required-password';
import { WindowNavbar } from './window/WindowNavbar';

export default function AppShell() {
  return (
    <>
      <WindowNavbar />
      <RequiredPassword />
      <Outlet />
    </>
  );
}
