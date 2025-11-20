// @ts-ignore
import React from 'react';
import { Outlet } from 'react-router-dom';
import { RequiredPassword } from '../components/organisms/required-password';

export default function AppShell() {
  return (
    <>
      <RequiredPassword />
      <Outlet />
    </>
  );
}
