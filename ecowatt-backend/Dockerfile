# Usa uma imagem base leve do Node.js
FROM node:22-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o package.json e package-lock.json para instalar dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Comando de inicialização é definido no docker-compose.yml para uso de 'npm run dev'
# A porta 3000 é exposta internamente
EXPOSE 3000