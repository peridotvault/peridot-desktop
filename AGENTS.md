# AGENTS.md - PeridotVault Desktop Development Guide

This file provides essential information for agentic coding agents (and developers) working on the PeridotVault desktop application.

## Build & Development Commands

### Development Server

```bash
npm run dev          # Start local dev server (Vite)
```

### Build & Type Checking

```bash
npm run build        # TypeScript compile + Vite build
tsc                  # Type check only (strict mode enabled)
npm run preview      # Preview production build
```

### Tauri (Desktop Build)

```bash
npm run tauri dev    # Run desktop app in dev mode
npm run tauri build  # Build production desktop binaries
```

### Testing

Currently, no test framework is configured. When tests are added:

```bash
# Run single test file (expected format)
npm test path/to/test.spec.ts
npm test -- --watch  # Watch mode
```

## Code Style Guidelines

### Formatting

- **Formatter:** Prettier (configured in `.prettierrc`)
- **Print Width:** 100 characters
- **Indentation:** 2 spaces
- **Quotes:** Single quotes (except JSX: double quotes)
- **Semicolons:** Always
- **Trailing Commas:** All (ES5+)
- **Line Endings:** LF

### TypeScript & Imports

**Import Order:**

1. External dependencies (React, viem, solana, etc.)
2. Absolute path aliases (@shared, @main, @features, etc.)
3. Relative imports (./sibling, ../parent)
4. Type imports should use `import type`

**Example:**

```typescript
import React, { useCallback } from 'react';
import { deriveEvmAddressFromSeed } from '@shared/utils/evm';
import { walletService } from '@shared/services/wallet';
import type { PGCGame } from '@shared/interfaces/game';
import { formatTitle } from '../utils/formatTitle';
```

### Path Aliases (tsconfig.json)

Use these in imports to maintain clean structure:

- `@/*` → `src/*`
- `@pages/*` → `src/areas/main/pages/*`
- `@main/*` → `src/areas/main/*`
- `@features/*` → `src/areas/main/features/*`
- `@shared/*` → `src/shared/*`
- `@core/*` → `src/core/*`

### Type Annotations

- Enable strict mode (required by tsconfig.json)
- Always annotate function parameters and returns
- Use `type` for type-only imports
- Avoid `any` - use proper types or generics
- Use discriminated unions for complex state

**Example:**

```typescript
export async function fetchGames(address: string): Promise<PGCGame[]> {
  // Implementation
}

type GameStatus = 'owned' | 'installed' | 'installing';

interface RealLibraryGame {
  gameId: string;
  name: string;
  status: GameStatus;
}
```

### Naming Conventions

- **Files/Folders:** kebab-case (e.g., `game-card.tsx`, `library-service.ts`)
- **Variables/Functions:** camelCase (e.g., `fetchGames`, `gameCount`)
- **Types/Interfaces:** PascalCase (e.g., `PGCGame`, `LibraryEntry`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `REGISTRY_ADDRESS`)
- **Booleans:** Prefix with `is`, `has`, `can` (e.g., `isLoading`, `hasError`)
- **Event Handlers:** Prefix with `handle` (e.g., `handleConfirm`, `onClick`)
- **React Components:** PascalCase file names (e.g., `GameCard.tsx`)

### Error Handling

**Use try-catch with proper context:**

```typescript
try {
  const result = await fetchData();
} catch (err) {
  console.error('[FeatureContext] Failed to fetch data:', err);
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

**Context Logging Pattern:**

- Use square brackets `[Module/Feature]` prefix for console logs
- Example: `console.warn('[useMyGames] Failed to query runtime DB:', error)`
- Always include the context for debugging multi-blockchain scenarios

**HTTP Responses:**

```typescript
const response = await fetch(uri);
if (!response.ok) {
  throw new Error(`Failed: ${response.status} ${response.statusText}`);
}
const data = await response.json();
```

**Validation:**

```typescript
if (!metadata || !metadata.name) {
  console.warn(`[Service] Skipping invalid game: ${gameId}`);
  return null; // or continue in loops
}
```

### React & Hooks

**Component Structure:**

```typescript
interface ComponentProps {
  prop1: string;
  onClick: () => void;
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, onClick }) => {
  const [state, setState] = React.useState<Type>(initial);

  React.useEffect(() => {
    // Effect logic
  }, [dependency]);

  return <div>{prop1}</div>;
};
```

**Hooks Usage:**

- Use named hooks from `src/areas/main/features/*/hooks/` pattern
- Always include proper dependency arrays in `useEffect`
- Use `useCallback` for handler props to prevent unnecessary re-renders
- Use `useMemo` for expensive computations

### Multi-Blockchain Architecture

**When Fetching Games:**

1. Games can come from **EVM (Base Sepolia)** or **Solana (Devnet)**
2. Both blockchains are queried in `useMyGames` hook
3. Add blockchain context in metadata: `metadata._blockchain = 'base-sepolia' | 'solana'`
4. Log blockchain failures separately for debugging

**Blockchain Service Pattern:**

```typescript
// src/shared/blockchain/{evm|solana}/services/game.ts
export async function getMyGames({ address }: { address: string }): Promise<PGCGame[]> {
  try {
    // Fetch from blockchain
    // Validate metadata (skip if name missing)
    // Log blockchain-specific context
  } catch (error) {
    console.error('[BlockchainName] Error:', error);
    return []; // Graceful fallback
  }
}
```

### Environment Variables

- Defined in `.env` and `.env.local`
- Access via `import.meta.env.VITE_*`
- Critical variables:
  - `VITE_API_BASE`: Dev API endpoint (https://api-dev.peridotvault.com)
  - `VITE_EVM_RPC_URL`: Base Sepolia RPC
  - `VITE_SVM_RPC_URL`: Solana Devnet RPC
  - `VITE_ENCRYPTION_KEY`: Wallet encryption key

### Database (Dexie)

- Local database stored in `src/core/storage/storage.db.ts`
- Tables: `kv` (key-value), `library` (game entries)
- Use async/await patterns with Dexie queries

**Example:**

```typescript
export async function getById(gameId: GameId): Promise<LibraryEntry | undefined> {
  return await libraryService.getById(gameId);
}
```

## Key Principles

1. **Strict TypeScript:** No `any` types, strict null checks enabled
2. **Error Context:** Always include module context in logs `[ModuleName]`
3. **Graceful Degradation:** Return empty arrays/null instead of throwing in service layers
4. **No Unused Variables:** TypeScript `noUnusedLocals` and `noUnusedParameters` enforced
5. **Async Best Practices:** Avoid promise hell - use async/await, proper error handling
6. **Path Aliases:** Always use aliases over relative imports when available
7. **Component Composition:** Break large components into smaller, focused components

## Repository Info

- **Type:** Tauri + React + TypeScript desktop app
- **Build Tool:** Vite 7.3.1
- **Package Manager:** pnpm
- **Framework:** React 19.2.4
- **State Management:** Zustand 5.0.12
- **Blockchain:** viem (EVM), @solana/web3.js (Solana)
- **UI:** Tailwind CSS 4.2.2, Material-UI 7.3.9
