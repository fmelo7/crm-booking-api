# infra

Repositorio independente de infraestrutura e operacao do CRM Booking.

## Responsabilidade

- Manter compose local, manifests, IaC, observabilidade e templates operacionais.
- Centralizar documentacao de release, deploy, rollback e alertas.
- Nao conter regra de negocio dos servicos.

## Origem da extracao

Base inicial: `crm-booking-api/infra`.

## Comandos esperados

```bash
docker compose up
```

Os comandos finais serao definidos no gate de infra e operacao.

## Evidencias do gate 1

- Repositorio local independente criado fora do monorepo.
- Primeiro commit criado com este README e `.gitignore`.
- URL remota: pendente ate criacao do repositorio no provedor Git.
