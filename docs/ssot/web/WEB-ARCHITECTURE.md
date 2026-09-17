# Web Architecture — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-WEB-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Stack

React 19, Vite 6, MUI 6, TanStack Query, Redux Toolkit (auth only), React Router, RHF+Zod, Axios, Playwright e2e scripts.

## Structure

- `src/app` — router, store, providers
- `src/features/*` — domain features
- `src/shared` — API client, layout shell, auth helpers

## Auth gates

`ProtectedRoute` (token) + `RoleRoute` (role) + `GuestOnlyRoute`.

## API

`apiClient` baseURL `VITE_API_BASE_URL` default `/api/v1` with Bearer + refresh interceptors.

## Portals

12 role layouts — see ROUTE-CATALOG.
