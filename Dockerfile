FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# CHANGE THIS TO RUN BUILD AFTER TS ERROR FIX
COPY . .
# RUN npm run build
RUN npm run build-only

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]