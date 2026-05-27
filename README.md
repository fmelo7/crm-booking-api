# CRM Booking API

Backend REST para um CRM de agendamentos, construído com Node.js, NestJS e suporte a MongoDB ou PostgreSQL.

A API gerencia clientes, serviços, profissionais e agendamentos. A documentação OpenAPI fica disponível via Swagger UI.

## Stack

- Node.js 20.x
- NestJS
- Express 5
- MongoDB com Mongoose ou PostgreSQL com `pg`
- Swagger UI
- `node:test` para testes automatizados

## Requisitos

- Node.js 20.x
- npm
- MongoDB local/Atlas ou PostgreSQL local/remoto

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` ou `.env.local` na raiz do projeto.

Use [.env.example](.env.example) como referência. Arquivos `.env*` reais não devem ser versionados.

Exemplo:

```env
PORT=3000
DATABASE_PROVIDER=mongodb
MONGODB_URI=mongodb://127.0.0.1:27017/crm-booking-api
POSTGRES_URI=postgres://postgres:postgres@127.0.0.1:5432/crm_booking_api
# DATABASE_URL=postgresql://user:password@host:port/railway
SWAGGER_SERVER_URL=http://localhost:3000
```

Variáveis:

| Nome | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não | Porta HTTP. Padrão: `3000`. |
| `APPOINTMENTS_SERVICE_PORT` | Não | Porta HTTP do serviço de appointments. Padrão: `3001`. |
| `APPOINTMENTS_SERVICE_URL` | Não | URL interna do serviço de appointments. Quando definida, o gateway encaminha `/api/appointments/*` para ela. |
| `CUSTOMERS_SERVICE_PORT` | Não | Porta HTTP do serviço de customers. Padrão: `3002`. |
| `SERVICES_SERVICE_PORT` | Não | Porta HTTP do serviço de services. Padrão: `3003`. |
| `PROFESSIONALS_SERVICE_PORT` | Não | Porta HTTP do serviço de professionals. Padrão: `3004`. |
| `DATABASE_PROVIDER` | Não | Banco usado pela aplicação: `mongodb` ou `postgres`. Padrão: `mongodb`. |
| `MONGODB_URI` | Não | URI do MongoDB. Padrão: `mongodb://127.0.0.1:27017/crm-booking-api`. |
| `POSTGRES_URI` | Não | URI do PostgreSQL. Usada quando `DATABASE_PROVIDER=postgres`. |
| `DATABASE_URL` | Não | URI alternativa do PostgreSQL, comum no Railway. Usada se `POSTGRES_URI` não estiver definida. |
| `SWAGGER_SERVER_URL` | Não | URL exibida como servidor base no Swagger. |
| `FRONTEND_PUBLIC_DIR` | Não | Diretório estático servido pela API. Padrão: `apps/frontend/public`. |
| `CORS_ORIGINS` | Não | Lista de origens permitidas, separadas por vírgula. Exemplo: `https://app.com,http://localhost:5173`. |
| `RATE_LIMIT_WINDOW_MS` | Não | Janela do rate limit em milissegundos. Padrão: `900000`. |
| `RATE_LIMIT_MAX` | Não | Número máximo de requisições por IP dentro da janela. Padrão: `300`. |
| `GATEWAY_AUTH_MODE` | Não | Modo de auth do gateway: `disabled` ou `bearer`. Padrão: `disabled`. |
| `GATEWAY_BEARER_TOKENS` | Não | Tokens bearer aceitos quando `GATEWAY_AUTH_MODE=bearer`, separados por vírgula. |
| `GATEWAY_PUBLIC_PATHS` | Não | Prefixos públicos extras, separados por vírgula. Padrões: `/`, `/api/health`, `/api-docs`. |
| `DATABASE_CONNECT_RETRIES` | Não | Tentativas de conexão com o banco antes de marcar a API como degradada. Padrão: `10`. |
| `DATABASE_CONNECT_RETRY_MS` | Não | Intervalo entre tentativas de conexão em milissegundos. Padrão: `3000`. |
| `DEBUG_ENV` | Não | Inclui variáveis mascaradas em `GET /api/health`. Use temporariamente para diagnóstico. |
| `NODE_ENV` | Não | Ambiente da aplicação, como `production`. |

## Rodando localmente

Com `.env`:

```bash
npm start
```

Com `.env.local`:

```bash
npm run start:local
```

Modo desenvolvimento com reload:

```bash
npm run dev
```

Ou usando `.env.local`:

```bash
npm run dev:local
```

Serviço de appointments separado:

```bash
npm run start:appointments
npm run dev:appointments
npm run start:customers
npm run dev:customers
npm run start:services
npm run dev:services
npm run start:professionals
npm run dev:professionals
```

Para fazer o gateway encaminhar appointments para o serviço separado:

```env
APPOINTMENTS_SERVICE_URL=http://localhost:3001
```

Infraestrutura local com Docker:

```bash
npm run infra:up
npm run infra:down
```

## Interface Web

Depois de subir a API, acesse:

```text
http://localhost:3000/
```

A interface permite cadastrar clientes, serviços e profissionais, além de criar, reagendar e cancelar agendamentos.

## Documentação Swagger

Depois de subir a API, acesse:

```text
http://localhost:3000/api-docs/
```

A spec é montada de forma modular. O arquivo [src/swagger.js](src/swagger.js) varre automaticamente arquivos `*.swagger.js` dentro de `packages/domains`.

Para documentar um novo módulo, crie um arquivo como:

```text
packages/domains/example/example.swagger.js
```

Exportando:

```js
module.exports = {
  schemas: {},
  paths: {},
};
```

## Health check

```http
GET /api/health
```

Exemplo de resposta:

```json
{
  "status": "ok",
  "dbConnected": true,
  "uptime": 12.34,
  "timestamp": "2026-05-21T14:00:00.000Z",
  "requestId": "9f91f0d7-4a9a-4cb4-9e5c-ea5f3a57e6ac"
}
```

Quando o banco configurado não está conectado, o endpoint responde `503` com `status: "degraded"`. Esse comportamento é usado como readiness check no Railway.

## Observabilidade

A API emite logs estruturados em JSON para inicialização, conexão com banco de dados, erros e requisições HTTP.

Cada requisição recebe um `x-request-id`; se o cliente não enviar esse header, a API gera um UUID. O mesmo identificador aparece nos logs e na resposta do health check.

Exemplo:

```json
{
  "timestamp": "2026-05-21T14:00:00.000Z",
  "level": "info",
  "service": "serv365-api",
  "environment": "production",
  "message": "HTTP request completed",
  "requestId": "9f91f0d7-4a9a-4cb4-9e5c-ea5f3a57e6ac",
  "http": {
    "method": "GET",
    "path": "/api/health",
    "status": 200,
    "durationMs": 4.21
  }
}
```

## Endpoints

Base local:

```text
http://localhost:3000
```

### Customers

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/customers` | Lista clientes. |
| `GET` | `/api/customers/:id` | Busca cliente por ID. |
| `POST` | `/api/customers` | Cria cliente. |
| `PUT` | `/api/customers/:id` | Atualiza cliente. |
| `DELETE` | `/api/customers/:id` | Remove cliente. |

Payload de criação/atualização:

```json
{
  "name": "Maria Silva",
  "phone": "+55 11 99999-9999",
  "email": "maria@example.com",
  "notes": "Prefere contato por WhatsApp"
}
```

### Services

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/services` | Lista serviços. |
| `GET` | `/api/services/:id` | Busca serviço por ID. |
| `POST` | `/api/services` | Cria serviço. |
| `PUT` | `/api/services/:id` | Atualiza serviço. |
| `DELETE` | `/api/services/:id` | Remove serviço. |

Payload de criação/atualização:

```json
{
  "name": "Corte de cabelo",
  "description": "Corte masculino ou feminino",
  "durationMinutes": 60,
  "price": 120
}
```

### Professionals

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/professionals` | Lista profissionais. |
| `GET` | `/api/professionals/:id` | Busca profissional por ID. |
| `POST` | `/api/professionals` | Cria profissional. |
| `PUT` | `/api/professionals/:id` | Atualiza profissional. |
| `DELETE` | `/api/professionals/:id` | Remove profissional. |

Payload de criação/atualização:

```json
{
  "name": "Ana Souza",
  "category": "Cabeleireira",
  "phone": "+55 11 98888-8888",
  "email": "ana@example.com",
  "active": true
}
```

### Appointments

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/appointments` | Lista agendamentos. |
| `GET` | `/api/appointments/:id` | Busca agendamento por ID. |
| `POST` | `/api/appointments` | Cria agendamento. |
| `PUT` | `/api/appointments/:id/reschedule` | Reagenda um agendamento. |
| `DELETE` | `/api/appointments/:id/cancel` | Cancela um agendamento. |

Payload para criar:

```json
{
  "customerId": "665f1d6f7c2a8e0012345671",
  "serviceId": "665f1d6f7c2a8e0012345672",
  "professionalId": "665f1d6f7c2a8e0012345673",
  "startAt": "2026-05-21T14:00:00.000Z",
  "notes": "Cliente pediu encaixe"
}
```

Payload para reagendar:

```json
{
  "startAt": "2026-05-21T16:00:00.000Z",
  "notes": "Cliente pediu para remarcar"
}
```

Regras de agendamento:

- `endAt` é calculado automaticamente usando a duração real do serviço.
- A API impede conflito de horário para o mesmo profissional.
- Cancelar um agendamento altera o status para `cancelled`.
- Concluir um agendamento altera o status para `completed`.

## Testes

```bash
npm test
```

Scripts disponíveis:

```bash
npm test
npm run test:integration
npm run test:nest
```

Os testes usam `node:test`. A suíte padrão cobre o caminho principal NestJS com testes Nest e integração. A suíte de integração sobe MongoDB em memória; os testes Nest e de integração usam `supertest`.

Cobertura atual:

- criação, busca, atualização e remoção de clientes
- criação, busca, atualização e remoção de serviços
- criação, busca, atualização e remoção de profissionais
- criação, busca, reagendamento e cancelamento de agendamentos
- validações de campos obrigatórios, IDs inválidos, registros não encontrados e conflitos de agenda

## Estrutura

```text
apps/
  api/
    app.js
    Dockerfile
    server.js
  frontend/
    public/
  appointments-service/
    app.js
    Dockerfile
    server.js
    createAppointmentsServiceApp.js
    src/
  customers-service/
  services-service/
  professionals-service/
packages/
  contracts/
  domains/
    appointment/
      appointment.repository.js
      rules/
      validation/
      infrastructure/
        mongo/
        postgres/
      docs/
    customer/
    professional/
    service/
  shared/
    common/
src/
  app.js
  server.js
  swagger.js
  configureBaseApp.js
  config/
    database.js
    postgres.js
  nest/
    app.module.js
    createNestApp.js
    appointment/
    customer/
    health/
    professional/
    repository/
    service/
test/
  integration/
  nest/
```

Responsabilidades:

- `apps/api`: entrypoint do runtime HTTP principal e primeira camada de gateway.
- `apps/api/gateway.js`: contexto de gateway, autenticação bearer configurável e rotas públicas.
- `apps/api/serviceProxy.js`: proxy configurável do gateway para serviços internos, começando por appointments.
- `apps/frontend/public`: frontend estático servido pela API.
- `apps/appointments-service`: primeiro boot separado do domínio de appointments.
- `apps/customers-service`: primeiro boot separado do domínio de customers.
- `apps/services-service`: primeiro boot separado do domínio de services.
- `apps/professionals-service`: primeiro boot separado do domínio de professionals.
- `docker-compose.yml`: infraestrutura local com gateway, serviços e MongoDB.
- `infra/README.md`: notas da infraestrutura local e portas expostas.
- `packages/contracts`: contratos compartilháveis entre app, frontend e futuros serviços.
- `packages/domains`: pacotes internos por domínio com models, repositories, validações, regras e Swagger.
- `packages/domains/appointment/rules`: regras puras de agenda sem dependência de banco.
- `packages/domains/appointment/validation`: adapters de validação do domínio para contratos públicos.
- `packages/domains/appointment/infrastructure`: adapters MongoDB/PostgreSQL do domínio.
- `packages/shared/common`: utilitários compartilhados sem dependência de runtime HTTP.
- `src/server.js`: carrega envs, conecta o banco e inicia o servidor NestJS.
- `src/app.js`: alias para a factory do app NestJS usada pelo caminho principal.
- `nest/`: runtime principal com controllers, modules, providers e repositories injetáveis.
- `configureBaseApp.js`: configura middlewares HTTP compartilhados, arquivos estáticos, Swagger e rate limit.
- `config/database.js`: centraliza a conexão com MongoDB ou PostgreSQL.
- `swagger.js`: monta a spec OpenAPI a partir dos módulos.
- `*.model.js`: define schemas Mongoose dentro da infraestrutura MongoDB do domínio.
- `*.repository.js`: seleciona ou implementa o adapter MongoDB/PostgreSQL do domínio.
- `validation/`: expõe schemas de validação consumidos pelos controllers NestJS a partir de contratos públicos.
- `*.swagger.js`: documenta schemas e paths do módulo.

## Deploy

O projeto inclui `Procfile` e está preparado para deploy em serviços como Railway.

Veja o guia completo em [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
