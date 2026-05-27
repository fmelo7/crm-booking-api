# Professionals service

Primeiro boot separado do domínio de profissionais.

Comandos:

```bash
npm run start:professionals
npm run dev:professionals
```

Configuração:

- `PROFESSIONALS_SERVICE_PORT`: porta HTTP do serviço. Padrão: `3004`.
- Usa as mesmas variáveis de banco do monólito enquanto a separação de schema/banco ainda não acontece.

Escopo atual:

- expõe `/api/health`;
- expõe `/api/professionals`;
- não expõe appointments, customers ou services como rotas próprias;
- ainda reutiliza providers Nest internos durante esta primeira etapa de extração.
