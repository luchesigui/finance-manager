FROM node:22-bookworm-slim

# python3/make/g++ são o fallback do better-sqlite3 (via node-gyp) caso não
# exista binário pré-compilado para a plataforma da imagem.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Camada de dependências separada da camada de código para aproveitar o cache do build.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# initializeDatabase() roda ao importar db.ts e cria um fortunate.db vazio
# neste diretório durante o build (o banco real do runtime é o do volume
# montado em /data, apontado via FORTUNATE_DB_PATH) — descarta o resíduo.
RUN npm run build && rm -rf data

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p ${PORT:-3000}"]
