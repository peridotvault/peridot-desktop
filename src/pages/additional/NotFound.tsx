// @ts-ignore
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex flex-col w-full h-screen items-center justify-center">
      <h1>Not Found</h1>
      <Link to={'/'}>Peridot Vault</Link>
    </main>
  );
}
