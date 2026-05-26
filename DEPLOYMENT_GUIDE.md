# Guia de Deployment - CRM Booking API no Railway

## 📋 Pré-requisitos
- Conta no GitHub (gratuita)
- Conta no Railway (gratuita com crédito inicial)
- Git instalado (já está ✓)

---

## 🚀 Passo 1: Criar Repositório no GitHub

### 1.1 Acesse GitHub
- Vá para [github.com](https://github.com)
- Faça login com sua conta
- Clique em "New" (novo repositório) ou use [este link](https://github.com/new)

### 1.2 Configure o Repositório
- **Repository name:** `crm-booking-api`
- **Description:** `CRM Booking API with NestJS, PostgreSQL/MongoDB and Node.js`
- **Visibility:** Public (recomendado) ou Private
- **Não inicialize** com README, .gitignore, ou LICENSE (já temos)
- Clique em **Create repository**

### 1.3 Copie a URL do repositório
Procure por uma URL como: `https://github.com/seu-usuario/crm-booking-api.git`

---

## 🔗 Passo 2: Conectar Repositório Local ao GitHub

Execute estes comandos no terminal (na pasta do projeto):

```bash
# Adicione o remote (substitua YOUR_GITHUB_URL pela URL copiada)
git remote add origin https://github.com/seu-usuario/crm-booking-api.git

# Renomeie a branch para main (se necessário)
git branch -M main

# Faça push do código
git push -u origin main
```

---

## 🛠️ Passo 3: Preparar o Projeto para Railway

### 3.1 Configurar PORT variável
Seu projeto já está pronto! O Railway injeta a variável `PORT` automaticamente em runtime.

O projeto também inclui `railway.json` com:
- comando de start: `npm start`
- health check em `/api/health`
- timeout de health check de 300 segundos
- restart automático em falha

### 3.2 Variáveis de Ambiente no Railway
O Railway precisará de:
- `DATABASE_PROVIDER` - `postgres` ou `mongodb`
- `POSTGRES_URI` ou `DATABASE_URL` - String de conexão com PostgreSQL, se usar Postgres
- `MONGODB_URI` - String de conexão com MongoDB, se usar MongoDB
- `PORT` - Porta (deixar em branco, Railway define automaticamente)
- `NODE_ENV` - Pode ser `production`

---

## 🚁 Passo 4: Implantar no Railway

### 4.1 Acesse Railway
- Vá para [railway.app](https://railway.app)
- Clique em **"New Project"** ou **"Deploy Now"**
- Selecione **"Deploy from GitHub Repo"**

### 4.2 Conecte seu GitHub
- Autorize o Railway a acessar sua conta GitHub
- Selecione o repositório `crm-booking-api`

### 4.3 Configure as Variáveis de Ambiente
No painel do Railway:
1. Clique em **Variables**
2. Adicione as variáveis:
   - `DATABASE_PROVIDER` = `postgres` ou `mongodb`
   - `POSTGRES_URI` = String de conexão com PostgreSQL, se usar Postgres
   - `MONGODB_URI` = String de conexão com MongoDB Atlas, se usar MongoDB
   - `NODE_ENV` = `production`
   - `PORT` = (deixar em branco - Railway atribui automaticamente)

### 4.4 Adicione Banco de Dados

**Opção A: PostgreSQL do Railway**
1. No painel do Railway, clique em **"Add Service"**
2. Selecione **"Database"**
3. Escolha **"PostgreSQL"**
4. Configure na API:
   - `DATABASE_PROVIDER=postgres`
   - `POSTGRES_URI=${{Postgres.DATABASE_URL}}`

> Em alguns projetos o Railway expõe a variável como `DATABASE_URL`. A API aceita `DATABASE_URL`, mas `POSTGRES_URI` deixa explícito qual banco a API está usando.

**Opção B: MongoDB Atlas**
1. Vá para [mongodb.com/atlas](https://mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um cluster gratuito
4. Crie um database e um usuário
5. Copie a string de conexão incluindo o nome do banco e as opções, por exemplo:
   ```text
   mongodb+srv://<usuario>:<senha>@cluster0.bcqvd84.mongodb.net/crm-booking-api?retryWrites=true&w=majority
   ```
6. Configure na API:
   - `DATABASE_PROVIDER=mongodb`
   - `MONGODB_URI=<sua string do Atlas>`

> Se a string não incluir o nome do database, o Mongoose pode abrir conexão em um database padrão inesperado. É melhor definir explicitamente o nome do banco.

---

## ✅ Passo 5: Verificar o Deployment

1. Railway gerará uma URL pública para sua API
2. Teste alguns endpoints:
   ```bash
   curl https://seu-railway-url.railway.app/api/health
   ```

3. Verifique os logs no painel do Railway para ver se está funcionando

O health check só retorna `200` quando o banco configurado está conectado. Se a aplicação subir sem conexão com banco, `/api/health` retorna `503`, o Railway considera o deploy não saudável e tenta reiniciar conforme `railway.json`.

---

## 🧪 GitHub Actions antes do Deploy

O projeto inclui o workflow `.github/workflows/ci.yml`, que roda em `push` para `main` e em Pull Requests:

```bash
npm ci
npm test
```

No Railway, mantenha o deploy conectado ao branch `main`. Assim o fluxo recomendado é abrir PR, esperar o GitHub Actions passar, fazer merge e deixar o Railway fazer o deploy automático.

---

## 🔄 Próximas Vezes

Após configurar tudo, para fazer update:

```bash
# Faça suas mudanças
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

Railway fará o deploy automaticamente! 🎉

---

## 📞 Suporte

- **Railway Docs:** https://docs.railway.app
- **GitHub Help:** https://docs.github.com
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
