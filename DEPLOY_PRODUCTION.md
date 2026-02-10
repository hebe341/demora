# Guia Rápido de Deploy em Produção

Este guia reúne passos mínimos para colocar o sistema em produção com Docker Compose e NGINX.

1) Preencha variáveis de ambiente

 - Copie `.env.example` para `.env.production` e substitua os valores (principalmente `JWT_SECRET`, `DATABASE_URL` e `NEXT_PUBLIC_API_URL`).

2) Build e subir com Docker Compose (recomendado)

```bash
cd /workspaces/acaba
cp .env.production .env
docker compose -f docker-compose.prod.yml up --build -d
```

3) SSL (Let's Encrypt)

Se o host tem domínio público, gere certs com certbot e atualize `nginx/default.conf` para apontar para os certificados:

```nginx
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;
```

4) Migrar banco (opcional)

Se estiver usando SQLite e quiser migrar para Postgres:

```bash
python3 scripts/sqlite_to_postgres.py backend/backend_data/database.sqlite /tmp/export_sql
# depois editar schemas se necessário e importar
./scripts/import_postgres.sh /tmp/export_sql postgres://user:pass@host:5432/dbname
```

5) Process manager alternativo (PM2)

```bash
cd /workspaces/acaba
npm install -g pm2
pm2 start deploy/pm2.config.js
pm2 save
```

6) Monitoramento e logs

- Adicionar Sentry DSN em variáveis de ambiente se quiser captura de erros.
- Ativar coleta de métricas Prometheus para endpoints importantes.

7) Backups

- Agende backup diário do volume Postgres ou do arquivo `database.sqlite` (se mantiver SQLite).

8) Checklist final

- [ ] JWT_SECRET rotacionado
- [ ] HTTPS ativo
- [ ] DB em volume persistente
- [ ] Monitoramento configurado
- [ ] Backups automáticos
