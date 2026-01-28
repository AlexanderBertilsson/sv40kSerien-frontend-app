# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expo + React Native cross-platform app (iOS, Android, Web) for a Warhammer 40k league management system ("SV40k Serien"). Uses Expo Router for file-based routing, React Query for server state, and Axios for API communication.

## Common Commands

- `npm start` — Start Expo dev server
- `npm run web` — Run web dev server (localhost:19006)
- `npm run android` / `npm run ios` — Run on device/emulator
- `npm test` — Run Jest tests (watch mode)
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run build:dev` / `build:staging` / `build:prod` — Web export builds (copies corresponding .env file)
- `npm run deploy:staging` — Build staging + deploy to S3/CloudFront

## Architecture

### Routing (Expo Router)

File-based routing under `src/app/`. The app uses tab navigation with optional stack navigation for nested routes.

- `src/app/_layout.tsx` — Root layout wrapping providers: GestureHandler → QueryClient → AuthProvider → SafeAreaProvider → DeviceDrawer
- `src/app/_layout.web.tsx` — Web-specific root layout variant
- `src/app/(tabs)/` — Tab group with: Home, Profile, Team, Ladder, Events, Pairings
- Profile and Team tabs are conditionally visible (require auth)
- Dynamic routes: `[eventId]`, `[teamId]`, `[userId]`

Platform-specific layouts use the `.web.tsx` suffix convention.

### State Management

- **Auth** — `src/contexts/AuthContext.tsx` handles OAuth login/logout, token storage (`expo-secure-store` on mobile, cookies on web), and auto-refresh on 401/403
- **Server state** — React Query (`@tanstack/react-query`) via custom hooks in `src/hooks/` (e.g., `useEvents`, `useMe`, `useTeams`)
- **Client state** — React Context for global state (`AuthContext`, `SidebarContext`), `useState` for component-local state

### HTTP Client

`src/components/httpClient/httpClient.ts` — Centralized Axios instance with request/response interceptors for token injection and automatic token refresh. Android dev uses `10.0.2.2:5109` to reach localhost.

### Environment Configuration

`src/config/environment.ts` manages dev/staging/prod environments. Required env vars: `EXPO_PUBLIC_CLIENT_ID`, `EXPO_PUBLIC_USER_POOL_URL`.

### Key Conventions

- TypeScript with strict mode; path alias `@/*` maps to repo root
- `src/hooks/` contains domain-specific hooks that combine data fetching with business logic
- `src/components/` organized by domain (auth, event, match, team, pairings, navigation, common, ui)
- `src/types/` for shared TypeScript interfaces
- Colors/theming in `src/constants/Colors.ts` and `src/theme/`
