# 🔐 Guia Implementação PCI-DSS: Stripe Integration

**Objetivo:** Remover violação PCI-DSS implementando Stripe tokenization  
**Tempo Estimado:** 6 horas  
**Dificuldade:** 🔴 CRÍTICA (mas executável)  
**Status:** ⏳ PRONTO PARA IMPLEMENTAÇÃO

---

## 📋 Pré-requisitos

### 1. Contas Necessárias
- [ ] Stripe Account (https://dashboard.stripe.com)
- [ ] Stripe API Keys (Public + Secret)
- [ ] Webhook signing secret (para eventos)

### 2. Dependências NPM
```bash
npm install stripe @stripe/react-stripe-js

# Verificar instalação
npm list stripe @stripe/react-stripe-js
```

### 3. Variáveis de Ambiente
```env
# .env (NUNCA commitar)
STRIPE_PUBLIC_KEY=pk_test_...  # Pública (pode ser commitada em .env.example)
STRIPE_SECRET_KEY=sk_test_...  # SECRETA (NUNCA commitar)
STRIPE_WEBHOOK_SECRET=whsec_... # Para webhooks

# .env.example (template safe)
STRIPE_PUBLIC_KEY=your-public-key
STRIPE_SECRET_KEY=your-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

---

## 🎯 Fase 1: Setup Backend (30 minutos)

### Step 1.1: Instalar Stripe SDK Backend
```bash
cd backend
npm install stripe
```

### Step 1.2: Criar Serviço Stripe
**Arquivo:** `backend/src/services/StripeService.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

/**
 * ✅ PCI-DSS COMPLIANT
 * Processa pagamento a partir de Payment Method Token (NOT raw card data)
 */
async function processPayment(paymentMethodId, amountInReais, bookingId) {
  try {
    // ✅ Validar inputs
    if (!paymentMethodId || amountInReais < 0.01) {
      throw new Error('Invalid payment parameters');
    }

    // ✅ Converter reais para centavos (Stripe usa cents)
    const amountInCents = Math.round(amountInReais * 100);

    logger.info('📍 Processing payment', {
      paymentMethodId: paymentMethodId.substring(0, 20) + '...',
      amount: amountInReais,
      bookingId
    });

    // ✅ Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      payment_method: paymentMethodId,
      confirm: true, // Confirmar imediatamente (token já validado no client)
      metadata: {
        bookingId,
        timestamp: new Date().toISOString()
      }
    });

    // ✅ Validar sucesso
    if (paymentIntent.status === 'succeeded') {
      logger.info('✅ Payment succeeded', {
        stripePaymentId: paymentIntent.id,
        amount: amountInReais
      });

      return {
        success: true,
        stripePaymentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: amountInReais,
        lastFour: paymentIntent.payment_method_details?.card?.last4 || 'N/A'
      };
    }

    // ✅ Tratamento de falhas
    if (paymentIntent.status === 'requires_action') {
      return {
        success: false,
        error: 'Autenticação adicional necessária',
        requiresAction: true,
        clientSecret: paymentIntent.client_secret
      };
    }

    throw new Error(`Payment intent status: ${paymentIntent.status}`);
  } catch (error) {
    logger.error('❌ Payment processing error', {
      error: error.message,
      bookingId
    });

    // ✅ Retornar erro sem expor detalhes sensíveis
    return {
      success: false,
      error: 'Erro ao processar pagamento. Tente novamente.',
      // Não incluir detalhes técnicos!
    };
  }
}

/**
 * ✅ Reembolsar pagamento (se necessário)
 */
async function refundPayment(stripePaymentId, reason = 'requested_by_customer') {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: stripePaymentId,
      reason
    });

    logger.info('✅ Refund processed', { refundId: refund.id });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status
    };
  } catch (error) {
    logger.error('❌ Refund error', { error: error.message });
    throw error;
  }
}

/**
 * ✅ Validar webhook do Stripe
 */
function constructEvent(body, signature) {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    logger.error('❌ Webhook signature verification failed', {
      error: error.message
    });
    throw new Error('Invalid webhook signature');
  }
}

module.exports = {
  processPayment,
  refundPayment,
  constructEvent,
  stripe // Exportar para uso direto se necessário
};
```

### Step 1.3: Criar Endpoint de Pagamento
**Arquivo:** `backend/src/routes/payments.js`

```javascript
const express = require('express');
const router = express.Router();
const StripeService = require('../services/StripeService');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const db = require('../db/factory');

/**
 * ✅ POST /api/payments
 * Aceita APENAS token de pagamento (não dados de cartão)
 */
router.post('/', auth.verifyToken, async (req, res) => {
  try {
    const { paymentMethodId, amount, bookingId } = req.body;
    const userId = req.user.userId;

    // ✅ Validações
    if (!paymentMethodId || !amount || !bookingId) {
      return res.status(400).json({
        error: 'Missing required fields: paymentMethodId, amount, bookingId'
      });
    }

    if (amount < 0.01) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // ✅ Verificar que booking pertence ao usuário
    const booking = db.bookings.get(bookingId);
    if (!booking || booking.user_id !== userId) {
      logger.warn('⚠️ Unauthorized payment attempt', { userId, bookingId });
      return res.status(403).json({ error: 'Booking not found' });
    }

    // ✅ Processar pagamento
    const paymentResult = await StripeService.processPayment(
      paymentMethodId,
      amount,
      bookingId
    );

    if (!paymentResult.success) {
      return res.status(402).json({ error: paymentResult.error });
    }

    // ✅ Armazenar apenas token de transação (não dados de cartão)
    db.payments.insert({
      booking_id: bookingId,
      user_id: userId,
      stripe_payment_id: paymentResult.stripePaymentId,
      amount,
      status: paymentResult.status,
      last_four: paymentResult.lastFour,
      created_at: new Date().toISOString()
      // ✅ NUNCA: cardNumber, cardExpiry, cardCVV
    });

    // ✅ Atualizar status de booking
    db.bookings.update(bookingId, { status: 'confirmed', paid: true });

    logger.info('✅ Payment recorded', {
      bookingId,
      amount,
      stripePaymentId: paymentResult.stripePaymentId
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      stripePaymentId: paymentResult.stripePaymentId
    });
  } catch (error) {
    logger.error('❌ Payment endpoint error', { error: error.message });
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

/**
 * ✅ POST /api/payments/:id/refund
 */
router.post('/:id/refund', auth.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // ✅ Buscar pagamento
    const payment = db.payments.get(id);
    if (!payment || payment.user_id !== userId) {
      return res.status(403).json({ error: 'Payment not found' });
    }

    // ✅ Processar reembolso
    const refundResult = await StripeService.refundPayment(
      payment.stripe_payment_id
    );

    db.payments.update(id, { status: 'refunded' });

    res.json({
      success: true,
      refundId: refundResult.refundId
    });
  } catch (error) {
    logger.error('❌ Refund error', { error: error.message });
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

/**
 * ✅ POST /api/webhooks/stripe
 * Receber eventos do Stripe em tempo real
 */
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = StripeService.constructEvent(req.body, sig);

    // ✅ Processar eventos relevantes
    switch (event.type) {
      case 'payment_intent.succeeded':
        logger.info('✅ Payment Intent succeeded', { eventId: event.id });
        // Pode fazer ações adicionais aqui se necessário
        break;

      case 'payment_intent.payment_failed':
        logger.warn('⚠️ Payment Intent failed', { eventId: event.id });
        // Notificar usuário
        break;

      case 'charge.refunded':
        logger.info('✅ Refund completed', { eventId: event.id });
        break;
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('❌ Webhook error', { error: error.message });
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;
```

### Step 1.4: Registrar Rotas no Backend
**Arquivo:** `backend/src/index.js`

```javascript
const paymentsRouter = require('./routes/payments');

// Adicionar após outras rotas
app.use('/api/payments', paymentsRouter);
```

---

## 🎯 Fase 2: Setup Frontend (30 minutos)

### Step 2.1: Instalar Stripe React
```bash
cd frontend
npm install @stripe/react-stripe-js @stripe/js
```

### Step 2.2: Adicionar Stripe Elements ao HTML
**Arquivo:** `public/index.html`

```html
<!-- No <head> -->
<script src="https://js.stripe.com/v3/"></script>

<!-- Na seção de pagamento, adicionar container para card element -->
<div id="card-element"></div>
<div id="card-errors"></div>
```

### Step 2.3: Reescrever Payment Form
**Arquivo:** `public/app.js`

```javascript
// ✅ Inicializar Stripe (NÃO salvar em variável global!)
let stripe = null;
let cardElement = null;

/**
 * ✅ FASE 2: Inicializar Stripe Elements
 * Executar quando a seção de pagamento carregar
 */
function initializeStripe() {
  // ✅ Ler public key do backend (ou .env)
  const STRIPE_PUBLIC_KEY = 'pk_test_...'; // Ou fetch do backend

  // ✅ Carregar Stripe library
  stripe = Stripe(STRIPE_PUBLIC_KEY);
  const elements = stripe.elements();

  // ✅ Criar card element (Stripe manage input, não nosso JS!)
  cardElement = elements.create('card', {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  });

  // ✅ Montar no container
  cardElement.mount('#card-element');

  // ✅ Mostrar erros em tempo real
  cardElement.on('change', function (event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
      displayError.style.color = '#fa755a';
    } else {
      displayError.textContent = '';
    }
  });
}

/**
 * ❌ REMOVER: handlePayment antiga (enviava raw card data)
 * ✅ SUBSTITUIR: Nova função que usa Stripe tokens
 */
async function handlePayment(amount, bookingId) {
  if (!stripe || !cardElement) {
    showAlert('Stripe não inicializado. Recarregue a página.', 'error');
    return;
  }

  // ✅ 1️⃣ Criar Payment Method a partir do card element
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement
    // ✅ Stripe gerencia a entrada, nosso código nunca toca nos dados
  });

  if (error) {
    showAlert(`Erro: ${error.message}`, 'error');
    return;
  }

  // ✅ 2️⃣ Enviar APENAS token ao backend (não dados de cartão)
  try {
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,  // ✅ Token apenas
        amount: amount,
        bookingId: bookingId
        // ❌ NUNCA: card.number, card.exp_month, card.cvc
      })
    });

    const result = await response.json();

    if (result.success) {
      showAlert('💚 Pagamento realizado com sucesso!', 'success');
      // Recarregar bookings
      loadUserBookings();
    } else {
      showAlert(`Erro: ${result.error}`, 'error');
    }
  } catch (error) {
    logger.error('Payment error', error);
    showAlert('Erro ao processar pagamento', 'error');
  }
}

/**
 * ✅ Chamar ao carregar a página
 */
document.addEventListener('DOMContentLoaded', () => {
  // ... outros inicializações ...
  initializeStripe();
});
```

### Step 2.4: Atualizar Botão de Pagamento
**Arquivo:** `public/index.html` (na seção de pagamento)

```html
<!-- ❌ REMOVER: inputs de cartão -->
<!-- 
<input type="text" id="cardNumber" placeholder="Número do Cartão" />
<input type="text" id="cardExpiry" placeholder="MM/YY" />
<input type="text" id="cardCVV" placeholder="CVV" />
-->

<!-- ✅ ADICIONAR: Card Element do Stripe -->
<div id="card-element" style="border: 1px solid #ccc; padding: 10px; border-radius: 4px;"></div>
<div id="card-errors" style="color: #fa755a; margin-top: 10px;"></div>

<!-- Botão -->
<button onclick="handlePayment(bookingTotal, currentBookingId)" class="btn-primary">
  Pagar com Cartão 💳
</button>
```

---

## 🎯 Fase 3: Validação (1 hora)

### Step 3.1: Testes com Cards Stripe
```bash
# Teste 1: Cartão válido (deve sempre passar)
Número: 4242 4242 4242 4242
Validade: 12/25 (qualquer data futura)
CVC: 123 (qualquer número)
✅ Resultado: Pagamento sucede

# Teste 2: Cartão rejeitado
Número: 4000 0000 0000 0002
✅ Resultado: Erro "Your card was declined"

# Teste 3: Autenticação 3D Secure (se configurado)
Número: 4000 0025 0000 3155
✅ Resultado: Popup de autenticação
```

### Step 3.2: Verificar Logs
```bash
# Verificar backend
tail -f logs/combined.log | grep -i payment

# Procurar por:
# ✅ "Payment succeeded" (bom)
# ❌ "Payment processing error" (verificar)
# ❌ "Payment intent status" (ver qual status)
```

### Step 3.3: Verificar Dashboard Stripe
1. Ir para https://dashboard.stripe.com
2. Clicar em "Payments"
3. Verificar que novos pagamentos aparecem
4. Verificar "Webhook Events" para confirmar webhooks chegando

### Step 3.4: Teste de Segurança
```bash
# ✅ TESTE CRÍTICO: Verificar que raw card data NÃO chega ao backend
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "4111111111111111",
    "cardExpiry": "12/25",
    "cardCVV": "123"
  }'

# ❌ Resultado indesejável: 200 OK (ainda vulnerável!)
# ✅ Resultado esperado: 400 Bad Request (seguro)
```

---

## 📋 Checklist Final

### Segurança
- [ ] Nenhum raw card data enviado ao backend
- [ ] Nenhum raw card data armazenado em DB
- [ ] Stripe SDK carregando do CDN (não local)
- [ ] HTTPS enforçado em produção
- [ ] Secrets não em repositório

### Funcionalidade
- [ ] Payment flow completo funciona
- [ ] Erros do Stripe são tratados
- [ ] Reembolsos funcionam
- [ ] Webhooks chegando

### Compliance
- [ ] PCI-DSS Level 1 confirmado pelo Stripe
- [ ] Audit trail completo de pagamentos
- [ ] Conformidade com regulamentações locais

### Performance
- [ ] Card element carrega < 1s
- [ ] Pagamento processa < 2s
- [ ] Sem bloqueios na UI

---

## 🚀 Deployment

### Para Staging
```bash
# 1. Obter Stripe test keys
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# 2. Fazer deploy
git push origin main

# 3. Verificar logs
# Procurar por: "Payment succeeded"
```

### Para Produção
```bash
# 1. Obter Stripe live keys (SEGURO!)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# 2. Atualizar secrets no ambiente
# Via: GitHub Secrets, Railway, ou seu provider

# 3. Fazer deploy
git tag v1.0.0-pci-compliant
git push origin v1.0.0-pci-compliant

# 4. Monitorar
# Dashboard Stripe em tempo real
```

---

## 🆘 Troubleshooting

### "Card element not mounting"
```
Erro: "Cannot read property 'mount' of undefined"

Solução:
1. Verificar que Stripe.js carregou (console do browser)
2. Verificar que div#card-element existe
3. Chamar initializeStripe() após DOMContentLoaded
```

### "Invalid API Key"
```
Erro: "Invalid API Key provided"

Solução:
1. Verificar .env tem STRIPE_PUBLIC_KEY
2. Verificar que pk_test_ ou pk_live_ está correto
3. Verificar que env vars foram recarregadas
```

### "Webhook signature verification failed"
```
Erro: "Invalid webhook signature"

Solução:
1. Verificar STRIPE_WEBHOOK_SECRET em .env
2. Verificar que webhook endpoint está registrado no Stripe Dashboard
3. Re-gerar signing secret se necessário
```

---

## 📚 Referências

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [PCI-DSS Level 1](https://stripe.com/pci-dss-compliance)
- [Webhook Events](https://stripe.com/docs/webhooks/setup)
- [Testing Cards](https://stripe.com/docs/testing)

---

**Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO  
**Tempo:** ~6 horas  
**Criticidade:** 🔴 BLOQUEIA PRODUÇÃO  
**Próximo:** Semana 2 - N+1 Query Optimization
