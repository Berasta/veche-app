FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

ENV VITE_PB_URL=https://admin.weche.ru

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

# Install node for the meta server
RUN apk add --no-cache nodejs npm

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Meta server
COPY server.js /app/server.js
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 80

CMD sh -c "node /app/server.js & nginx -g 'daemon off;'"
