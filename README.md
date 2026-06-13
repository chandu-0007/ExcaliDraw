# ExcaliDraw

A **real-time collaborative drawing application** inspired by Excalidraw, built as a full-stack TypeScript monorepo. It features a Next.js frontend, a REST HTTP backend, and a dedicated WebSocket server — all orchestrated with Turborepo and deployable via Docker Compose.

---

##  Architecture Overview

```
ExcaliDraw/
├── apps/
│   ├── web/           # Next.js frontend (canvas drawing UI)
│   ├── http-server/   # REST API backend (auth, rooms, shapes)
│   └── ws-server/     # WebSocket server (real-time sync)
├── packages/
│   ├── db/            # Prisma ORM + PostgreSQL schema
│   ├── ui/            # Shared React component library
│   ├── eslint-config/ # Shared ESLint configuration
│   └── typescript-config/ # Shared tsconfig
├── Docker/            # Per-service Dockerfiles
├── docker-compose.yaml
├── turbo.json
└── pnpm-workspace.yaml
```

### Services

| Service | Port | Description |
|---|---|---|
| `web` | `3000` | Next.js frontend — drawing canvas UI |
| `http-server` (backend) | `3003` | REST API — auth, room management |
| `ws-server` | `8000` | WebSocket server — real-time collaboration |
| `postgres` | `5432` | PostgreSQL database |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TypeScript, CSS
- **Backend:** Node.js, TypeScript, Express (HTTP server)
- **WebSocket:** Node.js WebSocket server for real-time updates
- **Database:** PostgreSQL with Prisma ORM
- **Monorepo:** Turborepo + pnpm workspaces
- **Containerization:** Docker + Docker Compose 
---

##  Prerequisites

- **Node.js** >= 18
- **pnpm** 9.0.0 (`npm install -g pnpm@9.0.0`)
- **Docker & Docker Compose** (for containerized setup)

## System Architecture

```mermaid
graph TD
    A[Browser Clients<br/>Next.js + React + TypeScript] -->|HTTP / WebSocket| B[Load Balancer / Nginx]
    B --> C[Node.js Server 1<br/>Express + Socket.io]
    B --> D[Node.js Server 2<br/>Express + Socket.io]
    C <--> E[Redis Pub/Sub<br/>Cross-server event sync]
    D <--> E
    C --> F[(PostgreSQL<br/>via Prisma ORM)]
    D --> F
    C --> G[(Redis Cache<br/>Sessions)]
    D --> G
    H[GitHub Actions<br/>Lint + Type Check + Build] -->|Push image| I[Docker Hub]
    I -->|Pull & Deploy| J[AWS EC2<br/>Docker Compose]
```
---

##  Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/chandu-0007/ExcaliDraw.git
cd ExcaliDraw
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create `.env` files in the relevant app directories. At minimum you'll need:

**`apps/http-server/.env`**
```env
PORT=3003
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/mydb
```

**`apps/ws-server/.env`**
```env
JWT_SECRET=your_jwt_secret
```

### 4. Generate the Prisma client

```bash
pnpm run generate:db
```

### 5. Run in development mode

```bash
pnpm run dev
# or with global turbo:
turbo dev
```

This starts all apps concurrently. To target a specific app:

```bash
turbo dev --filter=web          # frontend only
turbo dev --filter=http-server  # backend only
turbo dev --filter=ws-server    # websocket server only
```

---

## Running with Docker Compose

The easiest way to spin up the entire stack:

```bash
docker-compose up --build
```

This starts:
- PostgreSQL (with a health check)
- Frontend on [http://localhost:3000](http://localhost:3000)
- HTTP backend on [http://localhost:3003](http://localhost:3003)
- WebSocket server on [ws://localhost:8000](ws://localhost:8000)

To stop:

```bash
docker-compose down
```

To stop and remove volumes:

```bash
docker-compose down -v
```

---

## 📦 Available Scripts

Run from the repository root:

| Script | Description |
|---|---|
| `pnpm run dev` | Start all apps in development mode |
| `pnpm run build` | Build all apps and packages |
| `pnpm run lint` | Lint all packages |
| `pnpm run check-types` | TypeScript type checking across all packages |
| `pnpm run format` | Format all `.ts`, `.tsx`, `.md` files with Prettier |
| `pnpm run generate:db` | Generate the Prisma client from the schema |
| `pnpm run start:backend` | Start the HTTP server in production mode |
| `pnpm run start:web` | Start the Next.js frontend in production mode |
| `pnpm run start:ws` | Start the WebSocket server in production mode |

---

## 🏃 Production Startup

After building (`pnpm run build`), start each service individually:

```bash
pnpm run start:backend   # HTTP server on port 3003
pnpm run start:ws        # WebSocket server on port 8000
pnpm run start:web       # Next.js frontend on port 3000
```

---

## 📁 Packages

### `packages/db`
Prisma schema and database client. Shared across the http-server and ws-server apps.

### `packages/ui`
Shared React component library consumed by the `web` app.

### `packages/eslint-config`
Shared ESLint rules (includes `eslint-config-next` and `eslint-config-prettier`).

### `packages/typescript-config`
Shared `tsconfig.json` base configurations for all packages and apps.

---

## 🔧 Turborepo & Caching

This project uses [Turborepo](https://turborepo.dev) for task orchestration and caching.

**Remote Caching (optional)** — share build caches with your team via Vercel:

```bash
turbo login
turbo link
```

For more on caching: [Turborepo Remote Caching docs](https://turborepo.dev/docs/core-concepts/remote-caching)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source. See the repository for license details.
