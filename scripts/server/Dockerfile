FROM openresty/openresty:1.19.9.1-12-alpine

ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY page.ljbc /page.ljbc

WORKDIR /app

RUN echo "${GIT_COMMIT_HASH}" > /app/commit.txt

ENTRYPOINT ["nginx", "-g", "daemon off;"]
