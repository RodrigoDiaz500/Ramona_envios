# ETAPA 1: Construcción
FROM node:18-alpine AS build
WORKDIR /app
# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install
# Copiamos el resto del código y compilamos para producción
COPY . .
RUN npm run build -- --configuration production

# ETAPA 2: Servidor Web
FROM nginx:alpine
# IMPORTANTE: Reemplaza "nombre-de-tu-proyecto" con el nombre real que genera Angular en la carpeta dist/
COPY --from=build /app/dist/nombre-de-tu-proyecto /usr/share/nginx/html
# (Si usan Angular 17+, la ruta suele ser /app/dist/nombre-de-tu-proyecto/browser)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]