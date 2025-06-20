FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY my-transport-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY my-transport-app/ ./

# Build production version
RUN npm run build

# Production environment stage
FROM nginx:1.23-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 