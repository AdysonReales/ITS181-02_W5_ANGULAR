# Stage 1: Build Angular application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve with NGINX
FROM nginx:alpine
COPY --from=build /app/dist/gmart /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
