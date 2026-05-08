# ZapZap - WhatsApp API Multi-tenant

API WhatsApp multi-tenant usando Venom JS com painel administrativo em Next.js.

## Stack

- **Backend**: Fastify + TypeScript + Prisma + PostgreSQL + Redis + BullMQ + Venom JS
- **Frontend**: Next.js 15 + Tailwind CSS + shadcn/ui
- **Infra**: Docker Compose

## Início Rápido

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Subir todos os serviços
docker-compose up -d

# 3. Rodar migrações
docker-compose exec backend npm run db:migrate

# 4. Criar admin inicial (via seed)
docker-compose exec backend npm run db:seed
```

## Serviços

| Serviço   | URL                   |
|-----------|-----------------------|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:3333 |
| Postgres  | localhost:5432        |
| Redis     | localhost:6379        |

## Desenvolvimento Local

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentação da API

### Autenticação Admin

```
POST /api/auth/login
Body: { email, password }
Returns: { token, admin }
```

### Envio de Mensagens (via token de API)

```
POST /api/messages/send-text
Authorization: Bearer zz_<token>
Body: { phone: "5511999999999", message: "Olá!" }
```

### Health Check

```
GET /health
```

## Variáveis de Ambiente

| Variável              | Descrição                        |
|-----------------------|----------------------------------|
| `DATABASE_URL`        | URL de conexão PostgreSQL        |
| `REDIS_URL`           | URL de conexão Redis             |
| `JWT_SECRET`          | Segredo JWT (mín. 32 caracteres) |
| `API_PORT`            | Porta da API (padrão: 3333)      |
| `ASAAS_API_KEY`       | Chave da API Asaas               |
| `ASAAS_ENVIRONMENT`   | `sandbox` ou `production`        |
| `NEXT_PUBLIC_API_URL` | URL da API para o frontend       |
