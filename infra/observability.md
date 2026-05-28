# Observabilidade

Este documento define a observabilidade minima para cada app do CRM Booking.

## Logs

Todos os processos emitem logs estruturados em JSON com:

- `timestamp`
- `level`
- `service`
- `environment`
- `message`
- `requestId` em eventos de request/erro
- `traceId` em eventos de request/erro

## Traces

Cada request recebe `x-request-id`, `x-trace-id` e `traceparent` na resposta.

Quando o cliente envia `traceparent`, o trace id W3C e preservado em `x-trace-id`. O gateway propaga `x-request-id`, `x-trace-id` e `traceparent` para servicos internos.

## Health e readiness

Cada app expoe:

```http
GET /api/health
```

O endpoint retorna `200` quando as dependencias obrigatorias estao prontas e `503` quando o app esta degradado. A dependencia de banco aparece em `dependencies.database`.

## Metricas

Cada app expoe metricas em formato Prometheus:

```http
GET /api/metrics
```

Metricas atuais:

- `http_requests_total`
- `http_request_duration_seconds`

Labels obrigatorias:

- `service`
- `method`
- `route`
- `status`

## Dashboard minimo por servico

Criar um dashboard por app com estes paineis:

| Painel | Query Prometheus sugerida |
| --- | --- |
| Requests por minuto | `sum by (service) (rate(http_requests_total[1m]))` |
| Taxa de erro 5xx | `sum by (service) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (service) (rate(http_requests_total[5m]))` |
| Latencia p95 | `histogram_quantile(0.95, sum by (service, le) (rate(http_request_duration_seconds_bucket[5m])))` |
| Readiness | probe HTTP em `/api/health` por servico |

## Alertas minimos

Alertas obrigatorios por servico:

| Alerta | Condicao sugerida | Janela |
| --- | --- | --- |
| ServiceDown | `/api/health` falhando ou ausente | 2m |
| HighErrorRate | erro 5xx acima de 5% | 5m |
| HighLatencyP95 | p95 acima de 1s | 10m |

## Evidencia local

`npm test` valida:

- contrato dos logs estruturados;
- health/readiness;
- exposicao de metricas;
- compatibilidade de `traceparent`;
- propagacao de trace pelo gateway.
