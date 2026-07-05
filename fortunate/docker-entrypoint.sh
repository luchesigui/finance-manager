#!/bin/sh
set -e

# Garante que a pasta do volume persistente exista e que as tabelas estejam
# criadas/atualizadas de acordo com src/db/schema.ts antes de subir o servidor.
# --force evita que o container fique parado esperando confirmação interativa
# caso uma mudança futura de schema implique perda de dados.
if [ -n "$FORTUNATE_DB_PATH" ]; then
  mkdir -p "$(dirname "$FORTUNATE_DB_PATH")"
fi

npx drizzle-kit push --force

exec "$@"
