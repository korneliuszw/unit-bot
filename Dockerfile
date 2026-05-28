FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY src/ src/

ENV DATA_DIR=/app/data
RUN mkdir -p /app/data

VOLUME /app/data

CMD ["bun", "run", "src/index.ts"]
