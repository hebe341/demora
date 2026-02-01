# 🧹 Leidy Cleaner - Plataforma de Limpeza Autônoma

**Status: 🟢 Trabalho em progresso — melhorias de UX, segurança e CI implementadas**

Plataforma completa de agendamento de limpeza com segurança, validações e integrações prontas para produção.

## 🚀 Quick Start

```bash
# 1. Validar tudo
bash test-local.sh

# 2. Iniciar Backend (Terminal 1)
cd backend && npm start

# 3. Iniciar Frontend (Terminal 2)
cd frontend && npm start

# 4. Testar
# Abra: http://localhost:3000
```

## 📚 Documentação

- **[COMECE_AQUI.md](COMECE_AQUI.md)** ← Leia PRIMEIRO (guia em 5 min)
- **[STATUS.md](STATUS.md)** - Estado atual completo
- **[INDICE.md](INDICE.md)** - Navegação de todos os docs
- **[DEPLOY_PRODUCAO.md](DEPLOY_PRODUCAO.md)** - Deploy passo-a-passo
- **[FINAL_REPORT.md](FINAL_REPORT.md)** - Relatório executivo

## ✅ 5 Problemas Críticos Corrigidos

| # | Problema | Status | Solução |
|---|----------|--------|---------|
| 1 | Segurança fraca | ✅ | Bcrypt + JWT 24h expiração |
| 2 | Dashboard com mock data | ✅ | Dados reais do backend |
| 3 | Integrações desativadas | ✅ | WhatsApp/Twilio ativo |
| 4 | Validações ausentes | ✅ | Email/Phone/CEP brasileiros |
| 5 | Sem error handling | ✅ | Mensagens claras ao usuário |

## 💰 Hospedagem Grátis

- Frontend (Vercel): **R$0**
- Backend (Railway): **R$0**
- Banco (Supabase): **R$0**
- WhatsApp (Twilio): **~R$5/mês** (opcional)
- **TOTAL: R$0/mês** 🎉

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 13, React 18, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Banco**: SQLite (dev), Supabase PostgreSQL (produção)
- **Segurança**: Bcrypt, JWT com expiração
- **Integrações**: Twilio (WhatsApp), Stripe (pagamentos)
- **Deploy**: Vercel + Railway + Supabase

## 📋 Contato da Empresa (Exemplo)

- Nome: Leidy Cleaner
- Telefone: +55 51 98030-3740
- PIX (chave): 51 98033 0422
- Conta: 000827519788-9
- Agência: 0435

Instruções rápidas:

1. Instalar dependências:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## 🔧 O que foi implementado agora

- Identidade visual renovada (tema verde, tipografia e melhorias CSS) — `public/index.html`
- Validação e máscara de CPF/telefone no frontend — `public/app.js`
- CSRF protection + CSP/HSTS no backend — `backend/src/middleware/csrf.js`, `backend/src/index.js`
- Logger com mascaramento de PII — `backend/src/utils/logger.js`
- Pipeline CI básico (GitHub Actions) — `.github/workflows/ci.yml`
- Google Analytics placeholder adicionado ao frontend (substitua o Measurement ID)

## ✅ Próximos passos recomendados

1. Otimizar imagens para WebP e configurar CDN
2. Implementar testes E2E para fluxo de agendamento
3. Configurar deploy automático (Vercel para frontend, Railway para backend)


2. Rodar com Docker Compose:

```bash
docker-compose up -d
```

3. Endpoints principais:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api