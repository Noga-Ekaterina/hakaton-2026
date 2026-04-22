# hakaton-2026

Monorepo for the QITask app:

- `apps/web/src/` - Vite + React frontend
- `apps/server/` - Express API with Prisma
- `packages/shared/` - shared domain types and `zod` schemas

## Scripts

- `npm run dev` - start the frontend only
- `npm run dev:all` - start the full monorepo with Turbo
- `npm run build` - build the frontend only
- `npm run build:all` - run builds across workspaces
- `npm run dev:server` - start only the API server
- `npm run db:push` - sync Prisma schema to MySQL
- `npm run db:seed` - seed the local `qitask` database

## Local setup

1. Start MySQL and create a database named `qitask`.
2. Set `apps/server/.env` with your local `DATABASE_URL`.
3. Run `npm install`.
4. Run `npm run db:push`.
5. Run `npm run db:seed`.
6. Start everything with `npm run dev:all`.

## API

- Frontend API base URL defaults to `http://localhost:4000`
- Auth uses an HTTP-only cookie
- The server exposes `/api/auth`, `/api/users`, `/api/projects`, `/api/tasks`, and `/api/meta`

## Deployment

- Vercel should use `apps/web` as the root directory
- The frontend production build is emitted to `apps/web/dist`
