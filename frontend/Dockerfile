#Build stage
FROM node:18-alpine AS build

#Set working directory inside the container
WORKDIR /app

COPY package*.json ./

#Install dependencies
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

#Production stage
FROM nginx:alpine

#Copy built application
COPY --from=build /app/dist/intelliinspect-frontend /usr/share/nginx/html

#Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

#Expose port
EXPOSE 80

#Start nginx
CMD ["nginx", "-g", "daemon off;"]
