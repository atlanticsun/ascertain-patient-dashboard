# Build stage: compile the React app
FROM node:20-alpine AS build

WORKDIR /app

# VITE_API_URL is baked into the bundle at build time
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Serve stage: static files behind nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
