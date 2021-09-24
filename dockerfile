FROM node:lts as builder

WORKDIR /app
COPY . .
RUN npm run install
RUN npm run build

FROM node:alpine

WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY ./package*.json ./

RUN npm install --production

CMD [ "node", "dist/main" ]