FROM openresty/openresty:1.19.9.1-12-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /app

ENTRYPOINT ["nginx", "-g", "daemon off;"]
