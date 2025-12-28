# Welcome to MOOQ

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Setup:

```bash
mkdir rustfs-data
mkdir rustfs-logs
sudo chown 10001:10001 rustfs-data
sudo chown 10001:10001 rustfs-logs
pnpm prisma migrate deploy
pnpm prisma generate
```

Start the development server with HMR:

```bash
docker compose up -d
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
pnpm run build
```
