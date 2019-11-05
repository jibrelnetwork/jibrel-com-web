FROM node:10

RUN mkdir /app
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY . .
RUN npm ci --loglevel warn && npm cache clean --force
RUN npm run build

RUN npm install pm2@4.1.2 -g

RUN wget --quiet https://github.com/jibrelnetwork/dockerize/releases/latest/download/dockerize-alpine-linux-amd64-latest.tar.gz \
 && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-latest.tar.gz \
 && rm dockerize-alpine-linux-amd64-latest.tar.gz

COPY run.sh /bin/run.sh

CMD ["run.sh", "start"]
