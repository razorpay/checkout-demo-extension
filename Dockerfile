FROM pronav/chrome:checkout as builder

ARG BUILD_NUMBER
ENV BUILD_NUMBER=${BUILD_NUMBER}

ARG BRANCH
ENV BRANCH=${BRANCH}

COPY . /checkout_build

WORKDIR /checkout_build

RUN cd /checkout_build \
    && npm install \
    && NODE_ENV=production npm run build \
    && DIST_DIR=/checkout_build/app/dist/v1 /scripts/compress

FROM c.rzp.io/razorpay/onggi:aws-cli-v2818

ARG BRANCH
ENV BRANCH=${BRANCH}

ARG AWS_CDN_BUCKET
ENV AWS_CDN_BUCKET=${AWS_CDN_BUCKET}

ARG AWS_REGION
ENV AWS_DEFAULT_REGION=${AWS_REGION}

ARG S3_KEY_ID
ENV AWS_ACCESS_KEY_ID=${S3_KEY_ID}

ARG S3_KEY_SECRET
ENV AWS_SECRET_ACCESS_KEY=${S3_KEY_SECRET}

RUN mkdir -p /app/dist/v1 \
    && mkdir -p /app/dist/v1/css

## Multi stage copy does not currently work with recursive directories. Hence, making explicit copy here for each of the subfolders
COPY --from=builder /checkout_build/app/dist/v1/* /app/dist/v1/
COPY --from=builder /checkout_build/app/dist/v1/css/* /app/dist/v1/css/

WORKDIR /app/dist/v1

RUN echo I am here

# Rename *.x.gz to *.x so that we serve gzipped files
RUN mv checkout.js.gz checkout.js
RUN mv checkout-frame.js.gz checkout-frame.js
RUN mv razorpay.js.gz razorpay.js
RUN mv css/checkout.css.gz css/checkout.css

RUN echo I am heres

# Upload to S3
RUN aws s3 sync /app/dist/v1 s3://$AWS_CDN_BUCKET/_checkout/$BRANCH/v1 \
    --acl public-read \
    --cache-control "max-age=2700, must-revalidate" \
    --content-encoding gzip \
    --exclude "*" \
    --include "*.js" \
    --include "*.css"

FROM c.rzp.io/razorpay/containers:app-nginx-brotli
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
