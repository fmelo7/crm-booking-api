FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

CMD ["node", "-e", "console.log(process.env.SERVICE_NAME || require('./package.json').name)"]
