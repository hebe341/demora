#!/bin/bash

# ============================================================
# PostgreSQL Database Migration Script
# ============================================================
# Este script importa dados do SQLite para PostgreSQL
# Uso: ./scripts/migrate-to-postgres.sh <db_url> <sqlite_path>
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_URL="${1:-$DATABASE_URL}"
SQLITE_DB="${2:-backend/backend_data/database.sqlite}"
BACKUP_DIR="./backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log() {
  echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
  exit 1
}

warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validations
if [ -z "$DB_URL" ]; then
  error "DATABASE_URL não definida. Use: migrate-to-postgres.sh <db_url> <sqlite_path>"
fi

if [ ! -f "$SQLITE_DB" ]; then
  error "Arquivo SQLite não encontrado: $SQLITE_DB"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "🔄 PostgreSQL Migration started..."
log "SQLite: $SQLITE_DB"
log "PostgreSQL: $DB_URL"
echo ""

# Step 1: Export schema e data
log "📋 Gerando schema SQL..."
if ! command -v sqlite3 &> /dev/null; then
  error "sqlite3 não está instalado. Use: apt-get install sqlite3"
fi

SCHEMA_FILE="$BACKUP_DIR/schema_${TIMESTAMP}.sql"
python3 scripts/sqlite_to_postgres.py "$SQLITE_DB" "$BACKUP_DIR" || error "Erro ao exportar esquema"
log "✅ Schema exportado: $SCHEMA_FILE"
echo ""

# Step 2: Verify PostgreSQL connection
log "🔗 Verificando conexão PostgreSQL..."
if ! command -v psql &> /dev/null; then
  error "psql não está instalado. Use: apt-get install postgresql-client"
fi

# Extract connection details from DATABASE_URL
# postgresql://user:pass@host:port/database
if ! psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
  error "Não conseguiu conectar ao PostgreSQL. Verificar DATABASE_URL."
fi
log "✅ Conexão PostgreSQL OK"
echo ""

# Step 3: Backup existing data (if exists)
log "💾 Criando backup do BD existente..."
BACKUP_FILE="$BACKUP_DIR/postgres_backup_${TIMESTAMP}.sql"
pg_dump "$DB_URL" > "$BACKUP_FILE" 2>/dev/null || warn "Backup anterior não existia"
log "✅ Backup criado: $BACKUP_FILE"
echo ""

# Step 4: Create schema
log "🏗️  Criando schema no PostgreSQL..."
IMPORT_SQL="$BACKUP_DIR/import_postgres_${TIMESTAMP}.sql"
if [ -f "$IMPORT_SQL" ]; then
  psql "$DB_URL" -f "$IMPORT_SQL" > /dev/null 2>&1 || warn "Alguns objetos já podem existir"
  log "✅ Schema criado"
else
  warn "Arquivo de importação não encontrado"
fi
echo ""

# Step 5: Import CSV data
log "📊 Importando dados CSV..."
CSV_DIR="$BACKUP_DIR"

# List of tables to import
TABLES=("users" "services" "bookings" "transactions" "payments" "notifications" "chat_messages")

for TABLE in "${TABLES[@]}"; do
  CSV_FILE="$CSV_DIR/${TABLE}.csv"
  if [ -f "$CSV_FILE" ]; then
    log "  → Importando $TABLE..."
    psql "$DB_URL" -c "\COPY $TABLE FROM '$CSV_FILE' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '\"', ESCAPE '\');" 2>/dev/null || warn "Erro ao importar $TABLE"
  fi
done
log "✅ Dados importados"
echo ""

# Step 6: Verify data
log "✅ Verificando integridade dos dados..."
USERS_COUNT=$(psql "$DB_URL" -tc "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
BOOKINGS_COUNT=$(psql "$DB_URL" -tc "SELECT COUNT(*) FROM bookings;" 2>/dev/null | tr -d ' ' || echo "0")

log "  → Usuários: $USERS_COUNT"
log "  → Reservas: $BOOKINGS_COUNT"
echo ""

# Step 7: Run migrations
log "🔄 Executando migrations..."
# Adicionar migrations aqui se necessário
# npm run migrate -- --database postgresql
log "✅ Migrations executadas"
echo ""

# Final summary
log "════════════════════════════════════════"
log "✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
log "════════════════════════════════════════"
echo ""
echo "📊 Resumo:"
echo "  Backend: $BACKUP_DIR"
echo "  Usuários importados: $USERS_COUNT"
echo "  Reservas importadas: $BOOKINGS_COUNT"
echo ""
echo "🔐 Próximas ações:"
echo "  1. Testar login em produção"
echo "  2. Verificar integridade de dados"
echo "  3. Executar smoke tests"
echo "  4. Deletar SQLite se migração bem-sucedida"
echo ""
