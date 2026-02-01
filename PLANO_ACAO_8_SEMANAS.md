# 🎯 Plano de Ação Integrado: Semanas 1-8

**Objetivo:** Transformar score 65/100 → 95/100 (eliminar vulnerabilidades críticas e implementar melhorias estratégicas)

---

## 📅 Semana 1: Conformidade PCI-DSS (CRÍTICA)

### 🎯 Objetivo
Remover violação PCI-DSS de dados de cartão no frontend

### ✅ Tarefas

#### Tarefa 1.1: Análise da Arquitetura de Pagamento
- [x] Mapear fluxo atual: `public/app.js` → `backend/payment` → stripe
- [x] Identificar 3 pontos de injeção de dados de cartão:
  - `handlePayment()` line 270: `cardNumber`, `cardExpiry`, `cardCVV` enviados em JSON
  - `validateCard()` line 255: Validação apenas regex (não oferece segurança PCI-DSS)
  - `backend/src/services/PaymentService.js`: Armazena dados em JSON (ILEGAL)

#### Tarefa 1.2: Integração Stripe.js (Tokenização Cliente)
**Arquivo:** `public/index.html`

Adicionar SDK Stripe ao `<head>`:
```html
<!-- Stripe.js para tokenização cliente (PCI-DSS compliant) -->
<script src="https://js.stripe.com/v3/"></script>
```

**Arquivo:** `public/app.js`

Reescrever `handlePayment()`:
```javascript
// ✅ PCI-DSS COMPLIANT: Nunca enviar raw card data
async function handlePayment(amount) {
  const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);
  
  // 1️⃣ Criar Payment Method sem expor dados
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement // card nunca toca no servidor
  });
  
  if (error) {
    showAlert(`Erro de pagamento: ${error.message}`, 'error');
    return;
  }
  
  // 2️⃣ Enviar APENAS token de pagamento (não dados de cartão)
  const response = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      paymentMethodId: paymentMethod.id,  // ✅ Token, não dados
      amount: amount,
      currency: 'BRL'
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showAlert('Pagamento realizado com sucesso!', 'success');
  } else {
    showAlert(`Erro no pagamento: ${result.error}`, 'error');
  }
}
```

#### Tarefa 1.3: Backend - Atualizar Endpoint de Pagamento
**Arquivo:** `backend/src/services/PaymentService.js`

```javascript
// ✅ ANTES: Armazenar dados de cartão (ILEGAL)
async function processPayment(cardData) {
  const { cardNumber, cardExpiry, cardCVV } = cardData;
  // ❌ Nunca fazer isso:
  db.payments.insert({ cardNumber, cardExpiry, cardCVV });
}

// ✅ DEPOIS: Processar apenas tokens
async function processPayment(paymentMethodId, amount) {
  // 1️⃣ Chamar Stripe API (servidor para servidor)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,  // Stripe em centavos
    currency: 'brl',
    payment_method: paymentMethodId,
    confirm: true
  });
  
  // 2️⃣ Armazenar APENAS resultado (não dados de cartão)
  db.payments.insert({
    stripe_payment_id: paymentIntent.id,
    status: paymentIntent.status,
    amount: amount,
    created_at: new Date()
    // ✅ Nenhum dado de cartão armazenado
  });
  
  return paymentIntent;
}
```

#### Tarefa 1.4: Validação e Testes
```bash
# Teste: Tentar enviar dados de cartão direto
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "4111111111111111",
    "cardExpiry": "12/25",
    "cardCVV": "123"
  }'

# ✅ Resultado esperado: 400 Bad Request
# ❌ Resultado inaceitável: 200 OK (ainda vulnerável)
```

**Estimated Effort:** 6 horas  
**Risk Level:** 🔴 CRÍTICA  
**Business Impact:** ✅ Conformidade PCI-DSS (legal compliance)

---

## 📅 Semana 2: Otimização de Queries (PERFORMANCE)

### 🎯 Objetivo
Eliminar problema N+1 que causa crash a 100+ bookings

### ✅ Tarefas

#### Tarefa 2.1: Análise de Query Performance
```javascript
// ❌ PROBLEMA: N+1 Queries em getUserBookings
function getUserBookings(userId) {
  const user = db.users.get(userId);           // Query 1
  
  const bookings = db.bookings.all({user_id: userId});  // Query 2
  
  // Para cada booking, query adicional:
  bookings.forEach(booking => {
    booking.reviews = db.reviews.get({booking_id: booking.id});  // Query N
    booking.service = db.services.get({id: booking.service_id}); // Query N
  });
  
  return { user, bookings };
}
// Total de queries: 1 + 1 + N + N = 2 + 2N (com 100 bookings = 202 queries!)
```

#### Tarefa 2.2: Criar Índices SQL
**Arquivo:** `database/migrations/add-indices.sql`

```sql
-- Índices para melhorar performance de queries
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Índices compostos para queries comuns
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date DESC);
```

#### Tarefa 2.3: Reescrever Queries com JOINs
```javascript
// ✅ SOLUÇÃO: Single query com JOINs
function getUserBookings(userId) {
  const query = `
    SELECT 
      b.id, b.date, b.time, b.address, b.status, b.final_price,
      s.name as service_name,
      r.rating as user_rating
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    LEFT JOIN reviews r ON b.id = r.booking_id AND r.user_id = ?
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;
  
  const bookings = db.all(query, [userId, userId]);
  // Total de queries: 1 (antes era 2 + 2N = 202!)
  
  return bookings;
}
```

#### Tarefa 2.4: Implementar Cache Redis
```javascript
// ✅ Cache para dados frequentemente acessados
const redis = require('redis').createClient();

async function getUserBookingsWithCache(userId) {
  const cacheKey = `bookings:${userId}`;
  
  // 1️⃣ Tentar cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // 2️⃣ Executar query otimizada
  const bookings = getUserBookings(userId);
  
  // 3️⃣ Armazenar em cache (5 minutos)
  await redis.setex(cacheKey, 300, JSON.stringify(bookings));
  
  return bookings;
}
```

**Estimated Effort:** 8 horas  
**Risk Level:** 🟡 MÉDIA (quebra potencial em queries antigas)  
**Performance Gain:** 📊 100+ bookings: 202 queries → 1 query (99.5% redução)

---

## 📅 Semana 3: Testes Abrangentes (QUALITY)

### 🎯 Objetivo
Aumentar cobertura de testes de 30% → 85%

### ✅ Tarefas

#### Tarefa 3.1: Setup de Testes
```bash
# Instalar framework de testes
npm install --save-dev jest @testing-library/react supertest
```

#### Tarefa 3.2: Criar Testes para PaymentService
**Arquivo:** `backend/__tests__/PaymentService.test.js`

```javascript
describe('PaymentService', () => {
  describe('processPayment', () => {
    test('✅ Deve processar pagamento com token Stripe válido', async () => {
      const paymentMethodId = 'pm_test_visa';
      const result = await PaymentService.processPayment(paymentMethodId, 100);
      
      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(100);
    });
    
    test('❌ Deve rejeitar cartão inválido', async () => {
      const invalidPaymentMethod = 'pm_test_chargeDecline';
      
      await expect(PaymentService.processPayment(invalidPaymentMethod, 100))
        .rejects.toThrow('Payment declined');
    });
    
    test('❌ Deve rejeitar dados brutos de cartão (PCI-DSS)', async () => {
      const cardData = {
        cardNumber: '4111111111111111',
        cardExpiry: '12/25'
      };
      
      await expect(PaymentService.processPayment(cardData))
        .rejects.toThrow('Use tokenization method');
    });
  });
  
  describe('refundPayment', () => {
    test('✅ Deve processar reembolso', async () => {
      const refund = await PaymentService.refundPayment('pi_test_123');
      expect(refund.status).toBe('succeeded');
    });
  });
});
```

#### Tarefa 3.3: Criar Testes para AuthService
**Arquivo:** `backend/__tests__/AuthService.test.js`

```javascript
describe('AuthService', () => {
  describe('generateToken', () => {
    test('✅ Deve gerar token JWT com 24h expiration', () => {
      const token = AuthService.generateToken('user123');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe('user123');
      expect(decoded.iat).toBeLessThan(decoded.exp);
      expect(decoded.exp - decoded.iat).toBe(24 * 60 * 60);
    });
    
    test('❌ Deve rejeitar token com secret fraco', () => {
      expect(() => {
        jwt.sign({}, 'weakSecret');
      }).not.toThrow(); // JWT permite, mas nosso middleware rejeita
    });
  });
  
  describe('verifyToken', () => {
    test('✅ Deve verificar token válido', () => {
      const token = AuthService.generateToken('user123');
      const verified = AuthService.verifyToken(token);
      
      expect(verified.userId).toBe('user123');
    });
    
    test('❌ Deve rejeitar token expirado', () => {
      const expiredToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      
      expect(() => AuthService.verifyToken(expiredToken))
        .toThrow('jwt expired');
    });
  });
});
```

#### Tarefa 3.4: Testes E2E (Cypress)
**Arquivo:** `cypress/e2e/booking-flow.cy.js`

```javascript
describe('Booking Flow E2E', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });
  
  it('✅ Deve completar fluxo de agendamento com sucesso', () => {
    // 1️⃣ Navegar para agendar
    cy.get('[data-cy=btn-agendar]').click();
    
    // 2️⃣ Preencher formulário
    cy.get('[data-cy=select-servico]').select('Corte');
    cy.get('[data-cy=input-data]').type('2024-12-25');
    cy.get('[data-cy=input-endereco]').type('Rua A, 123');
    
    // 3️⃣ Submeter
    cy.get('[data-cy=btn-submit-agendamento]').click();
    
    // 4️⃣ Validar sucesso
    cy.contains('Agendamento confirmado').should('be.visible');
  });
  
  it('❌ Deve rejeitar pagamento com cartão inválido', () => {
    // ... setup ...
    cy.get('[data-cy=btn-pagamento]').click();
    
    // Preencher cartão inválido
    cy.get('[data-cy=card-input]').within(() => {
      cy.get('iframe').then($iframe => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('[name=cardnumber]').type('4000000000000002');
      });
    });
    
    cy.get('[data-cy=btn-confirmar-pagamento]').click();
    cy.contains('Cartão rejeitado').should('be.visible');
  });
});
```

**Estimated Effort:** 12 horas  
**Risk Level:** 🟢 BAIXA  
**Quality Gain:** 📊 30% → 85% test coverage

---

## 📅 Semana 4: Segurança Avançada (HARDENING)

### 🎯 Objetivo
Eliminar vazamento de secrets e dados sensíveis

### ✅ Tarefas

#### Tarefa 4.1: Remover `.env` do Git
```bash
# Remover .env do histórico
git rm --cached .env
git commit -m "🔐 Remove .env from version control"

# Criar .env.example template
cat > .env.example << 'EOF'
# Authentication
JWT_SECRET=your-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vamos
DB_USER=postgres
DB_PASSWORD=your-password

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...

# Frontend
FRONTEND_URL=http://localhost:3000
EOF

git add .env.example
git commit -m "📝 Add .env template for developers"
```

#### Tarefa 4.2: Implementar Secrets Scanning no CI/CD
**Arquivo:** `.github/workflows/secrets-scan.yml`

```yaml
name: 🔐 Security Scanning

on: [push, pull_request]

jobs:
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Scan com TruffleHog
      - name: Scan for secrets
        run: |
          pip install truffleHog
          trufflehog filesystem . --json | tee scan-results.json
      
      # Fail se encontrar secrets
      - name: Check scan results
        run: |
          if [ -s scan-results.json ]; then
            echo "❌ Secrets found in repository!"
            cat scan-results.json
            exit 1
          fi
```

#### Tarefa 4.3: Rate Limiting por IP (DDoS Protection)
```javascript
// ✅ Em backend/src/index.js
const rateLimit = require('express-rate-limit');

// Rate limit por IP
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(ipLimiter);

// Rate limit específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas
  skipSuccessfulRequests: true
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  // ... auth logic
});
```

**Estimated Effort:** 4 horas  
**Risk Level:** 🟢 BAIXA  
**Security Gain:** 🛡️ Zero secrets exposure + DDoS protection

---

## 📅 Semana 5: Monitoramento & Logging (OBSERVABILITY)

### 🎯 Objetivo
Implementar observabilidade completa

### ✅ Tarefas

#### Tarefa 5.1: Centralizar Logs (Winston)
```javascript
// ✅ backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    // ✅ Production: enviar para serviço centralizado
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5 // Manter 5 arquivos
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### Tarefa 5.2: Health Checks & Metrics
```javascript
// ✅ Endpoint de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: checkDatabaseConnection(),
    cache: checkRedisConnection()
  });
});

// ✅ Metrics com Prometheus
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    }, duration);
  });
  next();
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

**Estimated Effort:** 6 horas  
**Risk Level:** 🟢 BAIXA  
**Observability Gain:** 📊 Complete visibility into system health

---

## 📅 Semana 6: Backup & Disaster Recovery (RELIABILITY)

### 🎯 Objetivo
Implementar backup automático e plano de recuperação

### ✅ Tarefas

#### Tarefa 6.1: Backup Automático do Banco de Dados
```bash
# ✅ scripts/backup-database.sh
#!/bin/bash

BACKUP_DIR="/backups/vamos"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_URL=$DATABASE_URL

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Fazer backup
pg_dump "$DB_URL" > "$BACKUP_DIR/backup_${TIMESTAMP}.sql"

# Manter apenas últimos 30 dias
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "✅ Backup realizado: $BACKUP_DIR/backup_${TIMESTAMP}.sql"
```

Adicionar ao crontab:
```bash
# Executar backup diariamente às 2 AM
0 2 * * * /path/to/backup-database.sh
```

#### Tarefa 6.2: Backup em Cloud Storage (AWS S3)
```javascript
// ✅ Fazer upload do backup para S3
const aws = require('aws-sdk');
const s3 = new aws.S3();

async function uploadBackupToS3(filePath) {
  const fileContent = require('fs').readFileSync(filePath);
  
  const params = {
    Bucket: process.env.BACKUP_BUCKET,
    Key: `backups/vamos-${Date.now()}.sql`,
    Body: fileContent,
    ContentType: 'application/x-sql'
  };
  
  const result = await s3.upload(params).promise();
  console.log(`✅ Backup uploaded to: ${result.Location}`);
  return result;
}
```

**Estimated Effort:** 3 horas  
**Risk Level:** 🟢 BAIXA  
**Reliability Gain:** 💾 RTO < 1 hour, RPO < 24 hours

---

## 📅 Semana 7: Escalabilidade (PERFORMANCE AT SCALE)

### 🎯 Objetivo
Preparar sistema para 10.000+ usuários

### ✅ Tarefas

#### Tarefa 7.1: Database Sharding (Particionamento)
```sql
-- ✅ Particionar tabela bookings por user_id para distribuir carga
CREATE TABLE bookings_1 PARTITION OF bookings
  FOR VALUES FROM (1) TO (100000);

CREATE TABLE bookings_2 PARTITION OF bookings
  FOR VALUES FROM (100000) TO (200000);

-- ... mais partições conforme necessário
```

#### Tarefa 7.2: Load Balancing com Nginx
```nginx
# ✅ /config/nginx/nginx.conf
upstream vamos_backend {
  server backend1.internal:3001 weight=5;
  server backend2.internal:3001 weight=5;
  server backend3.internal:3001 weight=3;
  
  # Health checks
  check interval=3000 rise=2 fall=5 timeout=1000 type=http;
  check_http_send "GET /health HTTP/1.0\r\n\r\n";
  check_http_expect_alive http_2xx;
}

server {
  listen 80;
  server_name api.vamos.com.br;
  
  # Cache static assets
  location ~* \.(js|css|png|jpg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
  
  # Proxy backend
  location /api/ {
    proxy_pass http://vamos_backend;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering on;
  }
}
```

**Estimated Effort:** 8 horas  
**Risk Level:** 🟡 MÉDIA (requer testes de load)  
**Scalability Gain:** 📈 10.000+ concurrent users

---

## 📅 Semana 8: Polish & Release (FINALIZATION)

### 🎯 Objetivo
Testes finais e deployment em produção

### ✅ Tarefas

#### Tarefa 8.1: Testes de Carga (Load Testing)
```bash
# ✅ Usar Apache JMeter para simular 1.000 usuários
jmeter -n -t load-test-plan.jmx -l results.csv -j log.jtl

# ✅ Críérios de sucesso
- Resposta < 200ms (p95)
- Taxa de erro < 1%
- CPU < 70%
- Memória < 80%
```

#### Tarefa 8.2: Security Audit Final
```bash
# ✅ OWASP Top 10 Checklist
- A01: Broken Access Control ✅
- A02: Cryptographic Failures ✅
- A03: Injection ✅ (XSS corrigido)
- A04: Insecure Design ✅
- A05: Security Misconfiguration ✅
- A06: Vulnerable Components ⏳
- A07: Authentication Failures ✅
- A08: Software & Data Integrity ✅
- A09: Logging & Monitoring ✅
- A10: SSRF ✅
```

#### Tarefa 8.3: Deployment em Produção
```bash
# ✅ Checklist final
- [ ] Todos os testes passando (100% coverage)
- [ ] Secrets não existem em repositório
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Runbook de disaster recovery testado
- [ ] Team treinado em operação
- [ ] Plano de rollback pronto

# Deploy
git tag v1.0.0-security-hardened
git push origin v1.0.0-security-hardened

# CI/CD automáticamente fará deploy
```

**Estimated Effort:** 5 horas  
**Risk Level:** 🟢 BAIXA (com plano de rollback)  
**Final Score:** 📊 65/100 → 95/100

---

## 📊 Resumo de Métricas

| Métrica | Semana 1 | Final | Ganho |
|---------|----------|-------|-------|
| **Vulnerabilidades Críticas** | 5 | 0 | -100% |
| **Test Coverage** | 30% | 85% | +55% |
| **Query Performance (N+1)** | 202 queries | 1 query | 99.5% ↓ |
| **PCI-DSS Compliance** | ❌ | ✅ | Legal ✅ |
| **Secret Exposure Risk** | 🔴 | 🟢 | Eliminated |
| **Overall Score** | 65/100 | 95/100 | +30 pts |

---

## 🎯 Success Criteria

- ✅ Zero vulnerabilidades críticas
- ✅ Conformidade PCI-DSS comprovada
- ✅ 85% de cobertura de testes
- ✅ <200ms response time (p95)
- ✅ Backup automático verificado
- ✅ Monitoramento em tempo real
- ✅ Plano de disaster recovery testado

---

**Status Geral:** 🟡 IN PROGRESS | Fase 1 concluída, Fases 2-8 planejadas  
**Próximo Milestone:** Semana 2 (PCI-DSS)  
**Responsável:** DevSecOps + Backend + Frontend Teams
