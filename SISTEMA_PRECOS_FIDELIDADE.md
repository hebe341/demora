# 💰 SISTEMA DE PREÇOS E FIDELIDADE - LEIDY CLEANER

## 🧮 CÁLCULO DE PREÇOS

### Fórmula Base

```
PREÇO FINAL = (1ª hora + horas adicionais) + quarter + tax_func + pós_obra - bônus
```

### Componentes Detalhados

#### 1️⃣ **PREÇO BASE (Horas)**

```
Primeira Hora:      R$ 40,00
Cada Hora +1:      +R$ 20,00

Exemplos:
├─ 1 hora  = R$ 40,00
├─ 2 horas = R$ 40 + R$ 20 = R$ 60,00
├─ 3 horas = R$ 40 + R$ 20 + R$ 20 = R$ 80,00
└─ 4 horas = R$ 40 + R$ 20 + R$ 20 + R$ 20 = R$ 100,00
```

#### 2️⃣ **QUARTO DO TRABALHO (Organização/Setup)**

```
Se ativado: +25% do preço base

Exemplo:
├─ Preço base: R$ 60
├─ Quarter (25%): +R$ 15
└─ Total: R$ 75,00
```

#### 3️⃣ **TAXA FUNCIONÁRIA (+40%)**

```
Se houver staff deslocada/ajudante: +40% do total

Exemplo:
├─ Subtotal (base + quarter): R$ 75,00
├─ Tax Func (+40%): +R$ 30,00
└─ Total: R$ 105,00
```

#### 4️⃣ **PÓS-OBRA (+50%)**

```
Se for limpeza pós-reforma: x1.5 (50% a mais)

Exemplo (SEM pós-obra):
├─ Subtotal: R$ 105,00
├─ Multiplicador: x1.0
└─ Total: R$ 105,00

Exemplo (COM pós-obra):
├─ Subtotal: R$ 105,00
├─ Multiplicador: x1.5
└─ Total: R$ 157,50
```

#### 5️⃣ **BÔNUS DE FIDELIDADE**

```
Após 10 faxinas 5⭐ seguidas: -R$ 100,00

Exemplo:
├─ Total calculado: R$ 157,50
├─ Bônus (10x 5⭐): -R$ 100,00
└─ Total COM desconto: R$ 57,50
```

---

## 📊 EXEMPLOS PRÁTICOS

### Cenário 1: Limpeza Básica (2h)

```
Dados:
├─ Duração: 2 horas
├─ Com staff: SIM
├─ Quarter do trabalho: NÃO
└─ Pós-obra: NÃO

Cálculo:
├─ 1ª hora: R$ 40,00
├─ 2ª hora: R$ 20,00
├─ Subtotal: R$ 60,00
├─ Tax Func (+40%): +R$ 24,00
└─ TOTAL: R$ 84,00
```

### Cenário 2: Limpeza Premium (3h com Quarter)

```
Dados:
├─ Duração: 3 horas
├─ Com staff: SIM
├─ Quarter do trabalho: SIM
└─ Pós-obra: NÃO

Cálculo:
├─ 1ª hora: R$ 40,00
├─ 2ª hora: R$ 20,00
├─ 3ª hora: R$ 20,00
├─ Subtotal base: R$ 80,00
├─ Quarter (+25%): +R$ 20,00
├─ Subtotal: R$ 100,00
├─ Tax Func (+40%): +R$ 40,00
└─ TOTAL: R$ 140,00
```

### Cenário 3: Limpeza Pós-Reforma (4h com Quarter)

```
Dados:
├─ Duração: 4 horas
├─ Com staff: SIM
├─ Quarter do trabalho: SIM
└─ Pós-obra: SIM (x1.5)

Cálculo:
├─ 1ª hora: R$ 40,00
├─ 2ª hora: R$ 20,00
├─ 3ª hora: R$ 20,00
├─ 4ª hora: R$ 20,00
├─ Subtotal base: R$ 100,00
├─ Quarter (+25%): +R$ 25,00
├─ Subtotal: R$ 125,00
├─ Tax Func (+40%): +R$ 50,00
├─ Subtotal: R$ 175,00
├─ Pós-obra (x1.5): R$ 175 × 1.5 = R$ 262,50
└─ TOTAL: R$ 262,50
```

### Cenário 4: Com Bônus de Fidelidade

```
Dados:
├─ Limpeza Premium (3h): R$ 140,00
├─ Usuário tem: 10 avaliações 5⭐
└─ Bônus disponível: R$ 100,00

Cálculo:
├─ Total calculado: R$ 140,00
├─ Aplica bônus: -R$ 100,00
└─ TOTAL COM DESCONTO: R$ 40,00
```

---

## 🎁 SISTEMA DE FIDELIDADE

### Bonificação

```
✅ Cada avaliação 5⭐ = +1 ponto no streak
✅ 10 avaliações 5⭐ SEGUIDAS = R$ 100 de bônus
✅ Bônus usado = Reset do streak
✅ Sem pressão = Se receber ≤4⭐, streak continua
```

### Status de Fidelidade do Usuário

```
Campos rastreados:
├─ five_star_streak (streak atual)
├─ total_five_stars (todas 5⭐ recebidas)
├─ loyalty_bonus (R$ disponível)
├─ bonus_redeemed (já usou bônus?)

Endpoints:
GET /api/bookings/{userId}/loyalty
├─ Retorna status completo
└─ Mostra progresso para próximo bônus
```

### Histórico de Bônus

```
Tabela: loyalty_history
├─ five_star: Registra 5⭐ recebida
├─ bonus_reached: Registra quando atingiu 10x
├─ bonus_redeemed: Registra quando usou bônus
└─ Cada evento com timestamp
```

---

## 📝 CADASTRO DE USUÁRIO

### Dados Obrigatórios (Todos)

```json
{
  "email": "usuario@email.com",
  "password": "senha_segura_123",
  "name": "João Silva",
  "phone": "11987654321",
  "cpf_cnpj": "12345678901"
}
```

### Dados Pessoais Complementares

```json
{
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01310100"
}
```

### Dados Empresariais (Para Staff/Funcionários)

```json
{
  "role": "staff",
  "company_name": "Limpeza Total LTDA",
  "company_cnpj": "12345678000190",
  "company_address": "Av Principal, 500",
  "company_phone": "1133330000",
  "bank_account": "123456789-0",
  "bank_routing": "001"
}
```

### Validações

```
✓ Email: RFC compliant (email@domain.com)
✓ CPF/CNPJ: Mínimo 11 dígitos
✓ Telefone: 11 dígitos (formato BR)
✓ CEP: 8 dígitos (formato BR)
✓ Staff: Requer company_cnpj + bank_account
```

---

## 🔌 ENDPOINTS

### Autenticação

```bash
POST /auth/register
├─ Registrar novo usuário
├─ Retorna: JWT token + refresh token
└─ Corpo: dados acima

POST /auth/login
├─ Login de usuário
├─ Retorna: JWT token + refresh token
└─ Corpo: { email, password }

POST /auth/refresh
├─ Renovar token expirado
├─ Retorna: novo access token
└─ Corpo: { refreshToken }
```

### Agendamentos

```bash
POST /api/bookings
├─ Criar novo agendamento
├─ Calcula preço automaticamente
└─ Corpo:
   {
     "serviceId": 1,
     "date": "2024-12-25",
     "time": "14:00",
     "durationHours": 2,
     "address": "Rua das Flores, 123",
     "phone": "11987654321",
     "hasStaff": true,
     "isPostWork": false,
     "hasExtraQuarter": false
   }

PUT /api/bookings/:id/rate
├─ Avaliar agendamento concluído
├─ Processa bônus se 5⭐
└─ Corpo:
   {
     "rating": 5,
     "review": "Excelente serviço!"
   }

GET /api/bookings/:userId/loyalty
├─ Ver status de fidelidade
└─ Retorna: streak, total, bônus disponível
```

---

## 💳 INTEGRAÇÃO COM PAGAMENTOS

```
Stripe recebe:
├─ final_price (já com descontos)
├─ booking_id (referência)
├─ user_id (cliente)
└─ service_id (serviço)

Após pagamento bem-sucedido:
├─ Status muda para "confirmed"
├─ SMS enviado ao cliente
├─ Staff notificado
└─ Agendamento entra em fila de execução
```

---

## 🔐 SEGURANÇA

```
✓ Senhas com Bcrypt (salt 10)
✓ JWT tokens com expiry (24h)
✓ Refresh tokens (7d)
✓ CPF/CNPJ encriptados
✓ Dados bancários encriptados
✓ Rate limiting ativado
```

---

## 📈 FLUXO COMPLETO

```
1. Usuário registra
   ├─ Preenche dados pessoais
   └─ Se staff: preenche dados empresariais

2. Usuário faz login
   ├─ JWT gerado
   └─ Token válido por 24h

3. Usuário agenda serviço
   ├─ Sistema calcula preço
   ├─ Mostra breakdown para cliente
   └─ Cliente confirma

4. Pagamento processado
   ├─ Stripe cobra valor
   ├─ Status = confirmed
   └─ Staff recebe notificação

5. Serviço executado
   ├─ Staff completa agendamento
   └─ Status = completed

6. Cliente avalia
   ├─ Se 5⭐: streak +1
   ├─ Se 10x 5⭐: ganha R$ 100
   └─ Próximo agendamento com desconto

7. Reduz bônus
   ├─ R$ 100 descontado automaticamente
   ├─ Streak reseta
   └─ Recomeça jornada para próximo bônus
```

---

**Tudo pronto para lançar! 🚀**
