ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["tail", "-f", "/dev/null"]