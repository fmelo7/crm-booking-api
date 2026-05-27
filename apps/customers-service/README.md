# Customers service

Primeiro boot separado do domínio de clientes.

Comandos:

```bash
npm run start:customers
npm run dev:customers
```

Configuração:

- `CUSTOMERS_SERVICE_PORT`: porta HTTP do serviço. Padrão: `3002`.
- Usa as mesmas variáveis de banco do monólito enquanto a separação de schema/banco ainda não acontece.

Escopo atual:

- expõe `/api/health`;
- expõe `/api/customers`;
- não expõe appointments, services ou professionals como rotas próprias;
- ainda reutiliza providers Nest internos durante esta primeira etapa de extração.
