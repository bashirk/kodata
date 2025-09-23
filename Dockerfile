# Stage 1: Build
# sudo git clone https://github.com/bashirk/kodata app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies & install
COPY package.json ./
RUN npm install

# Copy source & build
COPY . .
RUN npm run build

# Stage 2: Run on Nginx
FROM nginx:alpine

# Copy build output to Nginx HTML dir
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 5173

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]