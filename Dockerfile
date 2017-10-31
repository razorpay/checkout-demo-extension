FROM pronav/node as builder

COPY . /checkout_build 

WORKDIR /checkout_build


RUN cd /checkout_build \
    && npm install \
    && npm install glob \
    && gulp test:unit

FROM razorpay/containers:app-nginx
ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

ADD ./dockerconf /dockerconf

RUN mkdir -p /app/dist/v1 && chown -R nginx.nginx /app

COPY --from=builder /checkout_build/app/dist/v1/* /app/dist/v1/

WORKDIR /app

EXPOSE 80

ENTRYPOINT ["/dockerconf/entrypoint.sh"]
