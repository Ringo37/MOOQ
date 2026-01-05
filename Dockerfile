FROM node:22.19-slim AS base
RUN apt update -y && apt install -y openssl
RUN corepack enable

FROM  base AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies-env
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

FROM base AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm exec prisma generate && pnpm run build

FROM base
COPY ./package.json pnpm-lock.yaml prisma.config.ts /app/
COPY ./prisma /app/prisma
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/generated /app/generated
WORKDIR /app
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run start"]