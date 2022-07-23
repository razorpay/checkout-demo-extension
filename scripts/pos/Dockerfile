FROM alpine:3.16.1

COPY nginx.conf /etc/nginx/nginx.conf

RUN apk add nginx --no-cache && \
  echo 'WEIGHT_CANARY=${WEIGHT_CANARY:=5} && sed -i "s/W_CANARY/$WEIGHT_CANARY/;s/W_MAIN/$((100-2*$WEIGHT_CANARY))/" /etc/nginx/nginx.conf && nginx' > /startup.sh && \
  chmod +x /startup.sh

CMD /startup.sh
