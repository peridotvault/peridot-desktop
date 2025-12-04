# PeridotVault Desktop – Project Context

## 1. Overview

- PeridotVault Desktop launcher built with **Tauri v2** (multi-window desktop shell) + **React** + **TypeScript** + **TailwindCSS**.
- Two primary React windows:
  - **main** – full app experience (library, vault, market, studio, etc.).
  - **login** – wallet / login / onboarding flow.
- Each window has its own **entry**, **routes**, and **features**.
- Uses **hash-based routing** (`createHashRouter`) per window, with **lazy-loaded pages** and `Suspense` fallbacks for smoother code splitting.
- Shared domain & UI logic is centralized under `src/shared`.
- **Cross-area imports must not break boundaries** (see rules below).

---

## 2. Tech Stack

- **Desktop runtime:** Tauri v2 (Rust backend in `src-tauri`, JS/TS frontend in `src`)
- **Frontend:** React 18 + React Router (hash router)
- **Language:** TypeScript
- **Styling:** TailwindCSS (+ custom CSS in `src/shared/assets/styles`)
- **Icons:** FontAwesome (and custom icons under `shared/assets`)
- **State:** Likely Zustand-style stores (e.g. `useSoundStore`) for lightweight global state
- **Imports:** Absolute import aliases (e.g. `@pages/...`, `@shared/...`, `@login/...`)

---

## 3. Folder Structure (High Level)

- `docs/`  
  Project documentation. This context file lives here:  
  `docs/project-context.peridot-desktop.md`.

- `public/`  
  Static assets (images, icons, sounds, locales, raw notes, branding).

- `src/`
  - `areas/`
    - `main/` – main window:
      - `app/` – layouts, routes, wrappers for the main window.
      - `features/` – domain features (download, game, library, profile, wallet, etc.).
      - `pages/` – routed views for the main app.
      - `main.tsx` – React entry for the main window.
    - `login/` – login window:
      - `app/` – routes & app wrappers for login.
      - `features/` – login-specific features.
      - `pages/` – routed views (login/create/import/password).
      - `main.tsx` – React entry for the login window.
  - `shared/` – reusable code for all areas (see section 5).
  - `types/`, `vite-env.d.ts` – typings & env declarations.

- `src-tauri/`  
  Tauri v2 Rust side: commands, window definitions, capabilities, config.

- Root configs:  
  `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `package.json`, `pnpm-*`.

---

## 4. Import & Boundary Rules (MANDATORY)

1. **Areas cannot import from other areas.**
   - `src/areas/main/*` must **not** import anything from `src/areas/login/*`.
   - `src/areas/login/*` must **not** import anything from `src/areas/main/*`.

2. **Features inside an area are private to that area.**
   - Example: `src/areas/main/features/download/*` must not be imported from the login area.
   - If a feature needs to be shared, extract the shared parts into `src/shared`.

3. **Anything shared across areas belongs in `src/shared`.**
   - Shared components → `src/shared/components`
   - Shared hooks → `src/shared/hooks`
   - Shared services/API → `src/shared/services` / `src/shared/api`
   - Shared utils/helpers → `src/shared/utils`
   - Shared constants/interfaces → `src/shared/constants`, `src/shared/interfaces`

4. **When in doubt about reuse → move to `src/shared`.**
   - Do **not** “reach into” another area’s folder.
   - If multiple areas need the same logic/UI, promote it to `src/shared`.

5. **Imports:**
   - Prefer absolute aliases (`@shared/...`, `@pages/...`, `@login/...`) instead of deep `../../../` paths.
   - Still respect all boundaries above: aliases are for clarity, not to bypass rules.

---

## 5. Area Notes

### 5.1. `src/areas/main` (Main Window)

**Purpose:** Full app experience (vault, library, market, studio, user, profile, AI, etc.).

- **Routing (`app/routes.tsx`):**
  - Uses `createHashRouter` to build the router for the main window.
  - Wraps routes in an `AppShell` + `Main` layout.
  - Pages are often **lazy-loaded** and wrapped with a `withSuspense` helper using `<LoadingScreen />` as fallback.

- **Layouts (`app/layouts` & `pages/_layouts`):**
  - `AppShell.tsx` – global app shell for the main window.
  - `WindowNavbar.tsx` – integrates Tauri window controls, OS detection, and drag regions (`data-tauri-drag-region`).
  - `pages/_layouts/Main.tsx`, `Navbar.tsx`, `Sidebar.tsx` – page-level layouts.

- **Pages (`pages/`):**
  - `pages/library/*` – user library (list of games, game detail, components).
  - `pages/vault/*` – “vault” browsing and game detail.
  - `pages/market/*` – marketplace.
  - `pages/profile/*` – developer/user profile pages.
  - `pages/studio/*` – studio tools: team, game management, announcements.
  - `pages/user/*` – user profile/edit flows.
  - `pages/additional/*` – loading page, redirect page, updater screen.
  - `pages/not-found/*` – main-area 404 page.

- **Features (`features/`):**
  - Feature modules such as:
    - `download` – download system for games.
    - `game` – game metadata, local DB, services, types, utils.
    - `library` – library logic (installed games, views, hooks).
    - `profile` – profile/local-db/services.
    - `wallet` – wallet blockchain integration & views.
    - `ai`, `announcement`, `auth`, etc.
  - Each feature can have its own:
    - `api/`, `components/`, `hooks/`, `interfaces/`, `lib/`, `services/`, `utils/`, `local-db/`, `types/`, `views/`, etc.
  - These live **inside `main` only** and are **not** imported by `login`.

---

### 5.2. `src/areas/login` (Login Window)

**Purpose:** Handle wallet/login/onboarding flows separately from the main app.

- **Routing (`app/routes.tsx`):**
  - Simple `createHashRouter` returning login-related pages.
  - Routes like `/login`, `/create`, `/import`, `/password`.

- **Pages (`pages/`):**
  - `pages/login/index.tsx` – main Login screen:
    - Manages create/import toggles.
    - Redirects to main window when wallet already exists.
  - `pages/create/index.tsx` – create wallet/account flow.
  - `pages/import/index.tsx` – import wallet/account flow.
  - `pages/password/index.tsx` – password setup/unlock/reset flows.

- **Features (`features/`):**
  - Reserved for login-specific logic:
    - e.g., login-specific auth hooks, validators, forms.
  - These must remain **private to the login area**.
  - If login logic becomes generic across areas, move shared pieces to `src/shared`.

---

## 6. `src/shared` – Global Shared Layer

Everything under `src/shared` is **meant to be reusable** by both `main` and `login` areas (and future windows).

### 6.1. API Clients – `src/shared/api`

- `ai.api.ts` – AI-related APIs.
- `metadata.api.ts` – metadata fetching (games, assets, etc.).
- `wasabi.api.ts` – integration with Wasabi/object storage (game files, assets).

### 6.2. Assets – `src/shared/assets`

- `icons/MainIcons.tsx` – central icons.
- `json/app/categories.json`, `tags.json` – app category/tag configs.
- `json/coins.json`, `countries.json`, `currencies.json` – static reference data.
- `styles/index.css`, `styles/liquid-glass.css` – global styles/effects.

### 6.3. Blockchain – `src/shared/blockchain`

- `__core__/chain.types.ts`, `registry.services.ts` – chain type definitions & registry logic.
- `icp/sdk/*` – ICP actors, agents, canisters.
- `icp/services/*` – ICP game & registry services.
- `icp/types/*` – ICP-related data types.
- `solana/` – Solana-related code (current or future).

### 6.4. Components – `src/shared/components`

Design system & reusable UI, split into layers:

- `atoms/` – small building blocks (input fields, buttons, banners, stepper, etc.).
- `molecules/` – combined components (alerts, horizontal game tiles, etc.).
- `organisms/` – larger structures (LoadingScreen, LoadingLogo, search input).
- `cards/` – card UIs (coin price, vertical card).
- `ui/` – primitives like `avatar`, `ButtonWithSound`, `CoinPrice`, input variants, typography.
- Global components:
  - `ChainSwitcher`, `menu-avatar`, `Notification`, etc.

**Rule:** These must not depend on area-specific logic; they should only consume props and shared services/hooks.

### 6.5. Config & Constants

- `config/icp.ts` – ICP configuration.
- `constants/images.ts`, `constants/token.ts` – image and token constants.

### 6.6. Contexts

- `contexts/WalletContext.tsx` – React context for wallet state.

### 6.7. Database & Services

- `database/app-db.ts`, `database/events.ts`, `database/kv-keys.ts` – app DB and event/keys definitions.
- `services/local-db/kv-key.ts` – local DB helpers.
- `services/store.ts` – store helpers.
- `services/wallet.ts` – wallet service logic.

### 6.8. Desktop Integration

- `desktop/runtime.ts` – desktop/Tauri runtime helpers.
- `desktop/windowControls.ts` – window control helpers (minimize, close, etc.).

### 6.9. Hooks

- `hooks/useClickSound.ts` – hook to play UI click sound:
  - Uses shared sound store (`useSoundStore`) + `soundEngine`.
  - Checks enabled flags before playing.

### 6.10. Interfaces

- `interfaces/app/*` – `GameInterface`, `PurchaseInterface`.
- `interfaces/CoreInterface.tsx`, `game.ts`, `gameDraft.ts`, `library.ts`.
- `interfaces/helpers/icp.helpers.tsx`.
- `interfaces/kv-key.ts`.
- `interfaces/user/*` – developer and user interfaces.

### 6.11. Security

- `security/aes.ts` – AES encryption/decryption helpers.

### 6.12. States

- `states/sound.store.ts` – sound-related global store.
- `states/wallet-lock.store.ts` – wallet lock store.

### 6.13. Utils – `src/shared/utils`

General helper functions/components:

- `Additional.tsx`, `classifier.tsx`, `file.tsx`, `short-address.tsx`, `transformBlockToTrainedData.tsx`.
- `crypto.ts` – crypto utilities.
- `date.helper.ts` – date/time utilities.
- `icp.helper.ts` – ICP helper functions.
- `IndexedDb.ts` – IndexedDB utilities.
- `installedStorage.tsx` – storage for installed games.
- `os.ts` – OS detection.
- `run-pool.ts` – concurrency / job pool.
- `soundEngine.ts` – core sound engine.
- `token-info.ts` – token info helpers.

---

## 7. Coding Patterns & Conventions

- **Naming:**
  - Components: `PascalCase.tsx` (e.g. `WindowNavbar.tsx`, `LoadingScreen.tsx`).
  - Hooks: `useName.ts` / `useName.tsx` (e.g. `useClickSound.ts`).
  - Functions/variables: `camelCase`.
- **Routing:**
  - Uses `createHashRouter` with nested route objects.
  - Pages are often `React.lazy` + wrapped in a `withSuspense` helper component.
  - Fallbacks typically use `<LoadingScreen />`.
- **Layouts:**
  - Encapsulate window chrome and drag regions for Tauri.
  - Use `data-tauri-drag-region` where needed.
- **Imports:**
  - Prefer configured aliases (`@shared/...`, `@pages/...`, `@login/...`) over deep relative imports.
- **Hooks & side effects:**
  - Async side effects often wrapped in:
    ```ts
    useEffect(() => {
      void (async () => {
        // async logic
      })();
    }, []);
    ```
  - Zustand-like selectors: `useStore((s) => s.someField)`.

---

## 8. How to Correctly Add a New Feature

1. **Decide the scope:**
   - **Main window only:**  
     Place under `src/areas/main/features/<featureName>/`.
   - **Login window only:**  
     Place under `src/areas/login/features/<featureName>/`.
   - **Potentially shared:**  
     Place under `src/shared` in the appropriate subfolder:
     - UI → `shared/components`
     - Hook → `shared/hooks`
     - Service/API → `shared/services` or `shared/api`
     - Util/helper → `shared/utils`
     - Types → `shared/interfaces` or `shared/constants`

2. **Pages & Routes:**
   - **Main window:**
     - Put pages under `src/areas/main/pages/<section>/<Page>.tsx`.
     - Register routes in `src/areas/main/app/routes.tsx`.
     - Use lazy imports + Suspense wrappers to match the existing pattern.
   - **Login window:**
     - Put pages under `src/areas/login/pages/<name>/index.tsx`.
     - Register routes in `src/areas/login/app/routes.tsx`.

3. **Imports:**
   - Use aliases (`@shared/...`, `@pages/...`, `@login/...`) where configured.
   - **Never** import across areas (no `main` → `login` or `login` → `main` imports).
   - Do not pull area-specific code into `shared`.

4. **UI & State:**
   - Reuse shared components/hooks when possible.
   - If a component/hook is likely to be reused:
     - Put it directly in `src/shared/components` or `src/shared/hooks`.
   - New global state stores:
     - Put them in `src/shared/states`.
   - Area-only state:
     - Keep it inside the relevant area (e.g. `src/areas/main/features/...`).

5. **Tauri / Window Concerns:**
   - For window controls or drag regions, follow existing patterns in `WindowNavbar` and `desktop/windowControls`.
   - Use Tauri APIs consistently and respect any established runtime helpers in `src/shared/desktop`.

6. **Sound & UX:**
   - Follow the `useClickSound` pattern for UI sounds:
     - Preload on mount.
     - Use shared `soundEngine` and global store flags (`sound.store.ts`).
     - Avoid duplicating sound logic in components.

7. **Structure & Naming:**
   - Use PascalCase for components, camelCase for functions and variables.
   - Mirror existing subfolder conventions inside each feature:
     - `components`, `hooks`, `services`, `utils`, `interfaces`, `api`, `lib`, `types`, `local-db`, etc.
   - Keep feature folders self-contained and clean.

---

> **For AI / tools:**  
> When generating or editing code for this project, always:
>
> - Respect area boundaries (`main` vs `login`).
> - Use `src/shared` for truly shared logic.
> - Match the patterns and conventions described in this file.
