FROM razorpay/containers:app-nginx

ENV GIT_COMMIT_HASH="dev-commit"

COPY . /checkout

VOLUME ['/checkout']

ADD ./dockerconf /dockerconf

WORKDIR /checkout

RUN chown -R nginx.nginx /app

EXPOSE 80

ENTRYPOINT ["/dockerconf/entrypoint.sh"]
