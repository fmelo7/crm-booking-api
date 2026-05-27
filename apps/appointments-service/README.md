# Appointments service

Primeiro boot separado do domínio de agendamentos.

Comandos:

```bash
npm run start:appointments
npm run dev:appointments
```

Configuração:

- `APPOINTMENTS_SERVICE_PORT`: porta HTTP do serviço. Padrão: `3001`.
- Usa as mesmas variáveis de banco do monólito enquanto a separação de schema/banco ainda não acontece.

Escopo atual:

- expõe `/api/health`;
- expõe `/api/appointments`;
- não expõe customers, services ou professionals como rotas próprias;
- ainda reutiliza providers Nest internos durante esta primeira etapa de extração.
