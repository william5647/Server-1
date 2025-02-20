FROM alpine:latest
USER root
RUN apk add --update nodejs npm 
RUN apk add bash
COPY src/ /app
WORKDIR /app
RUN npm install
ENTRYPOINT [ "npm", "start" ]