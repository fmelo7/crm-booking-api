# Apps

Este diretório delimita os executáveis do produto:

- `api`: runtime HTTP principal em NestJS.
- `frontend`: aplicação web servida hoje como estático.
- `appointments-service`: ponto reservado para a primeira extração de microserviço.

O código em `src/` ainda concentra o runtime NestJS e os adapters compartilhados enquanto a migração física para `apps/` acontece de forma incremental.
