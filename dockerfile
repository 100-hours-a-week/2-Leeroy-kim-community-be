FROM node:20-alpine
WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .
CMD ["node","server.js"]