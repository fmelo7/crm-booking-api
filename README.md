# CRM Booking API

Backend REST para um CRM de agendamentos, construído com Node.js, Express e MongoDB.

A API gerencia clientes, serviços, profissionais e agendamentos. A documentação OpenAPI fica disponível via Swagger UI.

## Stack

- Node.js 20.x
- Express 5
- MongoDB com Mongoose
- Swagger UI
- `node:test` para testes unitários

## Requisitos

- Node.js 20.x
- npm
- MongoDB local ou uma URI do MongoDB Atlas

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` ou `.env.local` na raiz do projeto.

Exemplo:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/crm-booking-api
SWAGGER_SERVER_URL=http://localhost:3000
```

Variáveis:

| Nome | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não | Porta HTTP. Padrão: `3000`. |
| `MONGODB_URI` | Não | URI do MongoDB. Padrão: `mongodb://127.0.0.1:27017/crm-booking-api`. |
| `SWAGGER_SERVER_URL` | Não | URL exibida como servidor base no Swagger. |
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

A spec é montada de forma modular. O arquivo [src/swagger.js](src/swagger.js) varre automaticamente arquivos `*.swagger.js` dentro de `src/modules`.

Para documentar um novo módulo, crie um arquivo como:

```text
src/modules/example/example.swagger.js
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
  "timestamp": "2026-05-21T14:00:00.000Z"
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

- `endAt` é calculado automaticamente como 60 minutos depois de `startAt`.
- A API impede conflito de horário para o mesmo profissional.
- Cancelar um agendamento remove o registro.

## Testes

```bash
npm test
```

Os testes unitários usam `node:test` e mocks dos models Mongoose. Eles não dependem de MongoDB rodando.

Cobertura atual:

- criação, busca, atualização e remoção de clientes
- criação, busca, atualização e remoção de serviços
- criação, busca, atualização e remoção de profissionais
- criação, busca, reagendamento e cancelamento de agendamentos
- validações de campos obrigatórios, IDs inválidos, registros não encontrados e conflitos de agenda

## Estrutura

```text
src/
  app.js
  server.js
  swagger.js
  config/
    database.js
  modules/
    appointment/
      appointment.controller.js
      appointment.model.js
      appointment.routes.js
      appointment.service.js
      appointment.swagger.js
    customer/
    professional/
    service/
test/
  helpers/
  modules/
```

Responsabilidades:

- `app.js`: configura Express, JSON, Swagger UI, health check e rotas.
- `server.js`: carrega envs e inicia o servidor.
- `config/database.js`: centraliza a conexão com MongoDB.
- `swagger.js`: monta a spec OpenAPI a partir dos módulos.
- `*.routes.js`: define as rotas HTTP.
- `*.controller.js`: traduz request/response.
- `*.service.js`: concentra regras de negócio.
- `*.model.js`: define schemas Mongoose.
- `*.swagger.js`: documenta schemas e paths do módulo.

## Deploy

O projeto inclui `Procfile` e está preparado para deploy em serviços como Railway.

Veja o guia completo em [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
