FROM node:16.13.2-alpine3.14

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
WORKDIR /usr/src/app

RUN npm i -g pm2
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js"]