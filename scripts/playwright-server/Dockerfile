FROM node:16-bullseye-slim

RUN mkdir /app && \
  cd /app && \
  echo '{"dependencies":{"playwright-core":"1.27.1"}}' > package.json && \
  npm i && \
  npx playwright install --with-deps chromium webkit

COPY server.mjs /app/
WORKDIR /app
ENTRYPOINT ["node", "server.mjs"]

EXPOSE 8001
EXPOSE 8002
