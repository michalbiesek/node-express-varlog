FROM node as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production
COPY --from=builder /usr/src/app/dist ./dist

CMD [ "node", "dist/util/server.js" ]
