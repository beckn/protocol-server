FROM node:16.18-alpine3.15
ARG port
ARG default_yml

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN cp ${default_yml} config/default.yml

RUN npm run build

RUN npm i -g pm2
EXPOSE "$port"
CMD [ "pm2-runtime", "ecosystem.config.js" ]