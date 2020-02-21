FROM debian:10

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

RUN apt update \
 && apt install -y \
    curl \
    wget \
 && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
 && apt-get install -y nodejs \
 && mkdir /app \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .
RUN npm ci --loglevel warn \
 && npm cache clean --force \
 && npm run build \
 && cp run.sh /bin/run.sh

CMD ["run.sh", "start"]
