# CI/CD e release independente

Este guia define o minimo para cada repositorio novo operar sem depender do monorepo atual.

Repositorios que devem receber este padrao:

- `api-gateway`
- `appointments-service`
- `customers-service`
- `services-service`
- `professionals-service`
- `frontend`
- `contracts`
- `infra`

## Regra de independencia

Cada repositorio deve conseguir executar sozinho:

```bash
npm ci
npm test
npm run build
docker build .
```

O deploy de um repositorio nao deve exigir deploy dos outros. Quando houver breaking change, a mudanca deve ser versionada em contrato e implantada em fases.

## Arquivos minimos por repo backend

```text
.github/workflows/ci.yml
.github/workflows/release.yml
Dockerfile
README.md
.env.example
package.json
```

## Pipeline minimo

1. Pull request:
   - instalar dependencias com `npm ci`;
   - rodar lint quando existir;
   - rodar testes;
   - rodar build quando existir;
   - validar contratos quando existir;
   - validar build da imagem Docker.

2. Merge em `main`:
   - repetir CI;
   - publicar imagem apenas se o fluxo de release permitir.

3. Tag `v*.*.*`:
   - gerar imagem Docker versionada;
   - publicar no registry;
   - registrar release notes;
   - liberar deploy independente.

## Como aplicar em um repo novo

1. Copiar `infra/templates/github-actions/node-nest-service-ci.yml` para `.github/workflows/ci.yml`.
2. Copiar `infra/templates/github-actions/node-nest-service-release.yml` para `.github/workflows/release.yml`.
3. Ajustar `SERVICE_NAME`, porta, comandos e secrets do provedor de deploy.
4. Copiar `infra/templates/release-checklist.md` para `docs/release-checklist.md`.
5. Garantir que `npm test`, `npm run build` e `docker build .` funcionam localmente.
6. Abrir PR inicial no repositorio novo e validar o CI.

Para o frontend, usar `infra/templates/github-actions/frontend-ci.yml` no lugar do template Nest.

## Rollback

Todo release deve ter um caminho de rollback antes do deploy:

- imagem Docker anterior identificada;
- migracao reversivel ou plano de mitigacao;
- contrato anterior ainda aceito durante a transicao;
- variaveis de ambiente documentadas;
- health check validando o retorno.

Rollback nao deve depender de alterar codigo em outro repositorio.
