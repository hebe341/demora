# ⏰ PLANO DE 24H - Finalização Leidy Cleaner

**Deadline:** 2026-02-11 05:35 UTC (24 horas a partir de agora)

---

## 📋 TAREFAS CRÍTICAS (Ordem de Prioridade)

### BLOCO 1: Garantir Funcionamento 100% (2 horas)
- [x] Backend online
- [x] Frontend online  
- [x] Database com dados
- [ ] Testar fluxo completo: Login → Agendamento → Pagamento
- [ ] Corrigir qualquer erro encontrado
- [ ] Validar todas as APIs responsivas

### BLOCO 2: Remover/Simplificar Configurações Desnecessárias (1 hora)
- [ ] Remover referencias a Stripe credenciais reais
- [ ] Remover referencias a Sentry/NewRelic (opcional)
- [ ] Deixar PIX em modo funcional
- [ ] Simplificar variáveis .env

### BLOCO 3: Preparar para Export (2 horas)
- [ ] Criar script de backup do banco
- [ ] Criar documentação para importação
- [ ] Exportar estrutura do banco (schema)
- [ ] Criar lista de todas as tabelas e campos
- [ ] Listar todos os endpoints da API

### BLOCO 4: Testes Finais (2 horas)
- [ ] Teste de login com todos os usuários
- [ ] Teste de agendamento completo
- [ ] Teste de cálculo de preço
- [ ] Teste de dashboard
- [ ] Teste de mobile responsiveness
- [ ] Verificar não há erros de console

### BLOCO 5: Documentação de Saída (1 hora)
- [ ] README com instruções de setup
- [ ] Lista de endpoints
- [ ] Estrutura do banco
- [ ] Guia de importação para nova plataforma

### BLOCO 6: Deploy/Build Final (1 hora)
- [ ] Build frontend otimizado
- [ ] Build backend checado
- [ ] Gerar bundle para exportação
- [ ] Criar arquivo de backup final

### BLOCO 7: Verificação Final (1 hora)
- [ ] Tudo funcionando?
- [ ] Nenhum erro nos logs?
- [ ] Banco intacto?
- [ ] Exportação pronta?

---

## 🎯 Vamos Começar Agora

### PASSO 1: Testar Fluxo Completo (15 min)

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leidycleaner.com.br","password":"AdminPassword123!@#"}'

# 2. Pegar pricing
curl http://localhost:3001/api/pricing/hour-packages

# 3. Acessar frontend
http://localhost:3000

# 4. Fazer login no frontend
# Email: admin@leidycleaner.com.br
# Senha: AdminPassword123!@#
```

### PASSO 2: Criar Scripts de Export (30 min)

**Script 1: Backup do Banco**
```bash
sqlite3 /workspaces/acaba/backend/backend_data/database.sqlite ".dump" > leidy_database.sql
```

**Script 2: Export Schema**
```bash
sqlite3 /workspaces/acaba/backend/backend_data/database.sqlite ".schema" > leidy_schema.sql
```

**Script 3: Export Dados (sem schema)**
```bash
sqlite3 /workspaces/acaba/backend/backend_data/database.sqlite \
  ".mode insert" \
  ".output leidy_data.sql" \
  "SELECT * FROM users;" \
  "SELECT * FROM services;" \
  "SELECT * FROM bookings;"
```

### PASSO 3: Documentação de APIs (30 min)

Vou gerar lista completa de endpoints

### PASSO 4: Testes Automatizados (1 hora)

Vou criar script que testa:
- [ ] Login
- [ ] Logout
- [ ] List services
- [ ] Create booking
- [ ] Get pricing

### PASSO 5: Build Final (30 min)

```bash
# Frontend
cd /workspaces/acaba/frontend
npm run build

# Backend pronto já
npm start
```

---

## 🚀 COMEÇAR AGORA

Estou pronto para executar todas essas tarefas. Qual você quer que comece?

**Opção 1:** Eu executo TUDO automaticamente (vai tomar ~4 horas)
**Opção 2:** Você quer fazer alguma coisa específica primeiro?
**Opção 3:** Quer que eu comece pelo teste de fluxo completo?

---

**Status:** Pronto para começar ✅
**Tempo restante:** 24 horas ⏰
