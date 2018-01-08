FROM node:9.3.0-alpine
RUN yarn global add discord-rpbot && mkdir /opt/rpbot && chown node:node /opt/rpbot
WORKDIR /opt/rpbot
USER node
CMD rpbot --token $RPBOT_TOKEN
