# Contracts

Contratos compartilháveis entre apps e futuros microserviços.

Este pacote pode expor constantes, DTOs, schemas públicos, nomes de eventos e códigos de erro. Ele não deve importar infraestrutura HTTP, banco de dados, NestJS, Mongoose, `pg` ou repositories.

Contratos atuais:

- DTOs públicos de appointments.
- Status permitidos de appointments.
- Schemas de query e payload.
- Eventos versionados de appointments.
- Códigos de erro públicos de appointments.
