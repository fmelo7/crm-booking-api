# Deploy independente e rollback

Este documento define o minimo operacional para cada repositorio independente.

## CI em pull request

Cada repo deve manter `.github/workflows/ci.yml` com:

- `pull_request`;
- `push` para `main`;
- `npm ci`;
- `npm test`;
- `npm run build`;
- `docker build .` quando o repo possui `Dockerfile`.

## Release por tag

Cada repo deve manter `.github/workflows/release.yml`.

Apps com Docker publicam imagem versionada em `ghcr.io/${{ github.repository }}` com tags:

- tag semantica `vX.Y.Z`;
- SHA do commit.

Repos sem imagem operacional, como `contracts` e `infra`, validam teste/build e chamam hook de publicacao/aplicacao quando configurado.

## Deploy independente

O deploy e acionado por hook do proprio repositorio. Cada repo deve configurar seus secrets no provedor de CI:

- `DEPLOY_WEBHOOK_URL`
- `DEPLOY_WEBHOOK_TOKEN`

Para `infra`, use os secrets especificos:

- `INFRA_DEPLOY_WEBHOOK_URL`
- `INFRA_DEPLOY_WEBHOOK_TOKEN`

Nenhum secret real deve ser commitado em `.env.example`, README, workflow ou codigo.

## Rollback

Cada repo deve manter `.github/workflows/rollback.yml` com `workflow_dispatch`.

Apps com Docker recebem `image_tag` e reimplantam a imagem anterior:

```text
ghcr.io/<owner>/<repo>:<image_tag>
```

Repos sem imagem recebem `release_tag` para restaurar a versao anterior.

Secrets esperados:

- `ROLLBACK_WEBHOOK_URL`
- `ROLLBACK_WEBHOOK_TOKEN`

Para `infra`, use:

- `INFRA_ROLLBACK_WEBHOOK_URL`
- `INFRA_ROLLBACK_WEBHOOK_TOKEN`

## Checklist de rollback testado

Para considerar rollback testado:

- executar o workflow `Rollback` em ambiente de staging;
- informar a tag anterior;
- confirmar `/api/health`;
- verificar logs e metricas;
- registrar a evidencia no checklist de release.
