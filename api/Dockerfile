# Build de l'API Web Rojo
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Installation des dépendances
COPY package*.json ./
RUN npm install --production

# Copie du code
COPY src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]
