FROM satantime/puppeteer-node as builder

COPY ./scripts /scripts

ARG BUILD_NUMBER
ENV BUILD_NUMBER=${BUILD_NUMBER}

ARG CANARY_PERCENTAGE
ENV CANARY_PERCENTAGE=${CANARY_PERCENTAGE}

# for testing
ARG BRANCH
ENV BRANCH=${BRANCH}

ARG TRAFFIC_ENV
ENV TRAFFIC_ENV=${TRAFFIC_ENV}

RUN apt-get update -y && apt-get install -y brotli && apt-get install zopfli -y

COPY . /checkout_build

WORKDIR /checkout_build

SHELL ["/bin/bash", "-c"]

# because of post install script 
RUN git init 

RUN if [[ -n $CANARY_PERCENTAGE ]] || [[ -n $TRAFFIC_ENV ]]; then \
    cd /checkout_build \
    && yarn install \
    && NODE_ENV=production npm run build \
    && DIST_DIR=/checkout_build/app/dist/v1 /scripts/compress; \
    else \
    cd /checkout_build \
    && yarn install \
    && NODE_ENV=production npm test \
    && DIST_DIR=/checkout_build/app/dist/v1 /scripts/compress; \
    fi

FROM c.rzp.io/razorpay/onggi:aws-cli-v2818 as aws

ARG BRANCH
ENV BRANCH=${BRANCH}

ARG TRAFFIC_ENV
ENV TRAFFIC_ENV=${TRAFFIC_ENV}

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

RUN mkdir -p /app/dist/original \
    && mkdir -p /app/dist/original/css

COPY --from=builder /checkout_build/app/dist/v1/* /app/dist/original/
COPY --from=builder /checkout_build/app/dist/v1/css/* /app/dist/original/css/

WORKDIR /app/dist/v1

# Rename *.x.gz to *.x so that we serve gzipped files
RUN mv checkout.js.gz checkout.js
RUN mv checkout-frame.js.gz checkout-frame.js
RUN mv razorpay.js.gz razorpay.js
RUN mv css/checkout.css.gz css/checkout.css

# shell doesn't require [[ ]], it works with []
RUN if [ -z "$TRAFFIC_ENV" ]; then \
    aws s3 sync /app/dist/v1 s3://$AWS_CDN_BUCKET/_checkout/$BRANCH/v1 \
    --acl public-read \
    --cache-control "max-age=2700, must-revalidate" \
    --content-encoding gzip \
    --exclude "*" \
    --include "*.js" \
    --include "*.css"; \
    else \
    aws s3 sync /app/dist/v1 s3://$AWS_CDN_BUCKET/_checkout/$BRANCH/$TRAFFIC_ENV/v1 \
    --acl public-read \
    --cache-control "max-age=2700, must-revalidate" \
    --content-encoding gzip \
    --exclude "*" \
    --include "*.js" \
    --include "*.css"; \
    fi 
    
FROM c.rzp.io/razorpay/containers:app-nginx-brotli
ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

ADD ./dockerconf /dockerconf

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 \
    && chmod +x /usr/local/bin/dumb-init \
    && mkdir -p /app/dist/v1 \
    && mkdir -p /app/dist/v1/css

## Multi stage copy does not currently work with recursive directories. Hence, making explicit copy here for each of the subfolders
COPY --from=aws /app/dist/original/* /app/dist/v1/
COPY --from=aws /app/dist/original/css/* /app/dist/v1/css/

WORKDIR /app

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

CMD ["/dockerconf/entrypoint.sh"]
