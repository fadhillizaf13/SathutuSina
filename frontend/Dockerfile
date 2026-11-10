FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG REACT_APP_API_URL
ARG REACT_APP_DEMO_MODE=false

ENV REACT_APP_API_URL=$REACT_APP_DEMO_MODE

RUN npm run build

FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile

COPY --from=build /app/build /srv

EXPOSE 3000

CMD ["caddy","run","--config","/etc/caddy/Caddyfile","--adapter", "caddyfile"]