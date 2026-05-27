# Services service

Primeiro boot separado do domínio de serviços.

Comandos:

```bash
npm run start:services
npm run dev:services
```

Configuração:

- `SERVICES_SERVICE_PORT`: porta HTTP do serviço. Padrão: `3003`.
- Usa as mesmas variáveis de banco do monólito enquanto a separação de schema/banco ainda não acontece.

Escopo atual:

- expõe `/api/health`;
- expõe `/api/services`;
- não expõe appointments, customers ou professionals como rotas próprias;
- ainda reutiliza providers Nest internos durante esta primeira etapa de extração.
