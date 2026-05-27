# Frontend app

Aplicação web do CRM.

Hoje o frontend é estático e fica em `apps/frontend/public`.

No `docker-compose.yml`, ele roda em um container `nginx` separado na porta `8080` por padrão. O Nginx serve os arquivos estáticos e encaminha `/api/*` para o gateway `api:3000`.

Este diretório já isola o ponto de entrada para uma futura migração para React/Vite ou outro build dedicado.
