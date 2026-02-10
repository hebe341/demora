#!/usr/bin/env bash
# Script auxiliar para importar CSVs gerados pelo sqlite_to_postgres.py para um banco Postgres
# Uso: ./import_postgres.sh /path/to/export_dir postgres://user:pass@host:5432/dbname

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: import_postgres.sh /path/to/export_dir postgres://user:pass@host:5432/dbname"
  exit 1
fi

EXPORT_DIR="$1"
DB_URL="$2"

echo "Verificando files em $EXPORT_DIR"
ls -la "$EXPORT_DIR"

echo "Importando CSVs para $DB_URL"

# Extrai credenciais para psql via psql libpq connection string
export PGPASSWORD=$(echo "$DB_URL" | sed -E 's@.*:(.*)@\1@' | sed -E 's@/.*@@' || true)

# Simples: instruções para o usuário executar. Dependendo de permissões, use psql direto.
echo "\nEXECUTE the following commands manually (adjust user/host/db):\n"
for csv in "$EXPORT_DIR"/*.csv; do
  tbl=$(basename "$csv" .csv)
  echo "psql '$DB_URL' -c \"\copy $tbl FROM '$csv' CSV HEADER;\""
done

echo "\nSe preferir automatizar, rode os comandos acima (atenção a permissões)."
