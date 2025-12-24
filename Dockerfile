FROM node:22.19-slim AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:22.19-slim AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev --ignore-scripts

FROM node:22.19-slim AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate && npm run build

FROM node:22.19-slim
COPY ./package.json package-lock.json prisma.config.ts /app/
COPY ./prisma /app/prisma
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/generated /app/generated
WORKDIR /app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]