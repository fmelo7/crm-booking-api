# Melhorias em camadas, nesta ordem:

**1. Segurança básica**
- Remover credenciais reais dos `.env` locais se estiverem no repo.
- Adicionar `.gitignore` garantindo `.env`, `.env.local` e `node_modules`.
- Criar CORS configurável se o frontend for separado depois.
- Adicionar rate limit básico para evitar abuso.
- Melhorar mensagens de erro para não vazar detalhes internos.

**2. Validação de entrada**
Hoje a validação está manual nos services. Próximo passo bom:

- Validar payloads com uma lib tipo `zod` ou `joi`.
- Validar ObjectId em todos os módulos, não só appointment.
- Garantir formatos corretos de email, preço, duração, datas etc.

**3. Regras melhores de agendamento**
A agenda pode ficar bem mais forte:

- Usar `durationMinutes` real do serviço em vez de fixar 60 minutos.
- Bloquear agendamento no passado.
- Permitir filtrar agenda por data, profissional ou cliente.
- Adicionar status: `scheduled`, `cancelled`, `completed`, talvez em vez de deletar no cancelamento.
- Histórico de reagendamentos.

**4. Frontend**
O frontend atual é ótimo como MVP, mas dá para evoluir:

- Separar em app React/Vite se quiser algo mais escalável.
- Usar Bootstrap de forma mais completa com forms, cards, modals e alerts.
- Adicionar loading states.
- Trocar `confirm()` por modal de confirmação.
- Melhorar tela de agenda com filtro por dia/semana.

**5. API**
- Padronizar respostas de erro.
- Criar middleware global de erro.
- Criar middleware de validação.
- Adicionar paginação em listagens.
- Adicionar filtros:
  - `/api/appointments?from=...&to=...`
  - `/api/appointments?professionalId=...`
  - `/api/customers?search=...`

**6. Testes**
- Adicionar testes dos controllers.
- Adicionar testes de integração com banco de teste.
- Testar conflitos reais de agendamento.
- Testar endpoints com `supertest`.

**7. Observabilidade e deploy**
- Endpoint `/api/health` já existe, bom.
- Adicionar logs estruturados.
- Adicionar checks no Railway.
- Criar GitHub Actions rodando `npm test` antes de deploy.

Minha sugestão de próximo passo concreto: **melhorar o appointment usando a duração real do serviço e filtros de agenda por data/profissional**. Isso entrega valor real para o produto e deixa a API bem mais útil.

**8. Melhorias para usar MongoDB ou Postgres**

Para este projeto, eu faria em etapas:

- Criar repositories para Mongo, mantendo o comportamento atual.
- Trocar os services para usar repositories, não models Mongoose direto.
- Criar contrato mínimo por entidade: create, findById, findMany, updateById, deleteById, exists.
- Só depois adicionar Postgres.
- Padronizar IDs, datas e paginação, porque Mongo usa _id e Postgres normalmente usa id.

**9. Migrar para NestJS**

- migração para NestJS concluída no runtime principal
- módulos `customers`, `services`, `professionals` e `appointments` migrados para controllers/providers nativos do NestJS
- regras movidas para providers NestJS com repositories injetados
- repositories organizados em `RepositoryModule` compartilhado no NestJS
- healthcheck migrado para controller NestJS
- validação padronizada nos controllers NestJS com helpers `parseBody`, `parseQuery` e `parseIdParam`
  - aplicado em `customers`, `services`, `professionals` e `appointments`
  - schema específico criado para query de disponibilidade de agenda
- `AppointmentProvider` removido da dependência direta de Mongoose para validar IDs, usando util comum
- regras auxiliares de appointments extraídas para `appointment.rules.js`
- filtros de listagem de appointments extraídos para `appointment.rules.js`
- cálculo de janela e slots de disponibilidade extraído para `appointment.rules.js`
- montagem de queries de busca extraída para `searchQuery.js`
- asserções comuns de entidades extraídas para `entityAssertions.js`
- repository providers do Nest padronizados com fábrica `createRepositoryProvider`
- aplicação manual de decorators NestJS padronizada com helper `decorators.js`
- metadata de injeção NestJS padronizada com helper `injection.js`
- definição de módulos NestJS padronizada com helper `module.js`
- camada Express antiga removida do projeto:
  - `src/app.js` exporta a factory NestJS
  - `apps/api` é o entrypoint do runtime HTTP principal
  - `npm test` cobre NestJS + integração
  - `legacyApp`, `configureLegacyApp`, rotas, controllers, services e testes Express antigos foram removidos
- projeto preparado para separação em apps e microserviços:
  - `apps/api` criado como entrypoint do runtime HTTP principal
  - `apps/frontend/public` criado como fronteira do frontend estático
  - `apps/appointments-service` criado como placeholder da primeira extração de microserviço
  - `packages/contracts` criado para contratos compartilháveis, começando por eventos de appointments
  - `FRONTEND_PUBLIC_DIR` permite apontar a API para outro build de frontend
- próximo passo: mover fisicamente adapters/repositories compartilhados de `src/modules` para pacotes internos por domínio, mantendo contratos estáveis

**10. Caminho para microserviços**

Antes de separar em microserviços, manter o projeto como monólito modular em NestJS:

- Separar bem os módulos por domínio: appointments, customers, services e professionals.
- Definir contratos claros entre módulos, evitando imports diretos difíceis de extrair depois.
- Centralizar tipos/DTOs e validações compartilhadas em uma camada comum.
- Manter repositories atrás de providers para permitir trocar implementação local por chamada externa no futuro.
- Fortalecer testes por módulo antes de extrair qualquer serviço.

Quando fizer sentido extrair, começar pelo módulo `appointments`, porque concentra as regras mais importantes:

- disponibilidade de agenda;
- conflito de horários;
- reagendamento;
- cancelamento/conclusão;
- histórico de alterações.

Estratégia sugerida para a extração:

- Começar em monorepo com `apps/api-gateway` e `apps/appointments-service`.
- Usar REST no início se quiser simplicidade, ou mensageria/gRPC quando houver necessidade real.
- Evitar banco compartilhado entre microserviços no longo prazo.
- Planejar eventos de domínio, por exemplo `AppointmentCreated`, `AppointmentRescheduled`, `AppointmentCancelled`.
- Só extrair `customers`, `services` e `professionals` depois que `appointments` estiver estável como serviço separado.
