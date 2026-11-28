# Build the customer and operations preview as a standalone static web app.
FROM node:22-alpine AS build

WORKDIR /app
COPY apps/portal/package.json ./package.json
RUN npm install --no-audit --no-fund
COPY apps/portal/ ./
RUN npm run build

# Serve the Vite production output on blitz.cloud's expected port.
FROM nginxinc/nginx-unprivileged:alpine

USER root
COPY --from=build /app/dist/ /usr/share/nginx/html/
RUN printf '%s\n' \
  'server {' \
  '  listen 8080;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  add_header X-Content-Type-Options nosniff always;' \
  '  add_header Referrer-Policy strict-origin-when-cross-origin always;' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '  location /assets/ {' \
  '    expires 1y;' \
  '    add_header Cache-Control "public, immutable";' \
  '    add_header X-Content-Type-Options nosniff always;' \
  '    try_files $uri =404;' \
  '  }' \
  '}' > /etc/nginx/conf.d/default.conf
USER 101

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
