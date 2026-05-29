# frontend

Repositorio independente do frontend do CRM Booking.

## Responsabilidade

- Servir a UI publica do produto.
- Chamar apenas o `api-gateway` para operacoes HTTP.
- Nao chamar microservicos internos diretamente.

## Origem da extracao

Base inicial: `crm-booking-api/apps/frontend`.

## Runtime atual

- `public/index.html`, `public/app.js` e `public/styles.css` contem a UI real do produto.
- `nginx.conf` serve os assets estaticos e encaminha somente `/api/*` para o `api-gateway`.
- O Dockerfile usa nginx e copia os assets locais para `/usr/share/nginx/html`.

## Comandos esperados

```bash
npm ci
npm test
npm run build
docker build .
```

Esses comandos validam o frontend sem depender do monorepo.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README, `.env.example` e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
