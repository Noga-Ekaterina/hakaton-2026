# hakaton-2026

Starter project on `React + TypeScript + Redux Toolkit + Zod + React Hook Form + Tailwind CSS + Radix UI`.

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - build the project for production
- `npm run preview` - preview the production build

## Security note

`npm audit` currently reports 2 moderate vulnerabilities in the dev toolchain:

- `vite@5.4.21`
- `esbuild@0.21.5` (transitive dependency from Vite)

These issues affect local development tooling rather than the shipped React bundle.

## Why not upgrade to Vite 8 right now

The currently available fix suggested by `npm audit` is `vite@8.0.8`, but it requires a newer Node.js version:

- required: `^20.19.0 || >=22.12.0`
- current in this environment: `v20.11.0`

The same Node.js requirement applies to the latest `@vitejs/plugin-react`.

## Recommended upgrade path

1. Update Node.js to `20.19+` or `22.12+`.
2. Upgrade `vite` to `8.x`.
3. Upgrade `@vitejs/plugin-react` to the version compatible with `vite@8`.
4. Run `npm install`.
5. Verify with `npm run build` and `npm audit`.

## Temporary risk reduction

- keep the dev server on `localhost`
- avoid exposing it with `--host` unless really needed
- do not keep the dev server open while browsing untrusted sites
