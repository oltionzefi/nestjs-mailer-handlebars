ARG VERSION
ARG BASEIMAGE=node:${VERSION}-buster-slim
## First Stage
FROM ${BASEIMAGE} as development

WORKDIR /usr/src/app

COPY ./ ./
RUN npm i

RUN apt-get update; \
    apt-get install --no-install-recommends --no-install-suggests -q -y procps;
RUN apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false

# ----
## Second Stage
FROM ${BASEIMAGE} as build

COPY ./package*.json ./
COPY ./ts*.json ./
COPY ./nest*.json ./
COPY ./src ./src
COPY ./test ./test
COPY ./.env ./
COPY ./.eslintrc.js ./
COPY ./.prettierrc.js ./
COPY ./jest.config.js ./

RUN npm ci
RUN npm run build

# ----

## Third stage
FROM ${BASEIMAGE} as production

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/package*.json ./

RUN npm ci --omit=dev

# ----

## Fourth Stage // hide tokens
FROM ${BASEIMAGE}

## Needed for install 'dumb-init', check https://github.com/Yelp/dumb-init
RUN apt-get update && apt-get install -y ca-certificates wget; \
    wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64; \
    chmod +x /usr/local/bin/dumb-init; \ 
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false;

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/dmn ./dmn
COPY --from=production /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/.env ./
COPY --from=development /usr/src/app/dist ./dist

CMD ["dumb-init", "node", "dist/main.js"]