FROM pronav/chrome:checkout as builder

COPY . /checkout_build 

WORKDIR /checkout_build

RUN cd /checkout_build \
    && npm install \
    && npm run test \
    && npm run build \
    && DIST_DIR=/checkout_build/app/dist/v1 /scripts/compress

FROM razorpay/containers:app-nginx-brotli
ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

ADD ./dockerconf /dockerconf

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 \
    && chmod +x /usr/local/bin/dumb-init \
    && mkdir -p /app/dist/v1 \
    && mkdir -p /app/dist/v1/css

## Multi stage copy does not currently work with recursive directories. Hence, making explicit copy here for each of the subfolders
COPY --from=builder /checkout_build/app/dist/v1/* /app/dist/v1/
COPY --from=builder /checkout_build/app/dist/v1/css/* /app/dist/v1/css/

WORKDIR /app

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

CMD ["/dockerconf/entrypoint.sh"]
