# syntax=docker/dockerfile:1

# Build pg schema diff.
FROM golang:1.21 as buildPgSchemaDiff

WORKDIR /src

RUN git clone https://github.com/brightertw/pg-schema-diff.git

WORKDIR /src/pg-schema-diff

RUN go build -o /usr/local/bin/pg-schema-diff ./cmd/pg-schema-diff

# Build kakao talk scraper.
FROM node:18.16.0-alpine as build

ARG PACKAGE_SOURCE=package.json
ARG YARN_CACHE_PATCH=/usr/local/share/.cache/yarn

RUN apk add gcompat

WORKDIR /usr/src/app

# Copy pg schema diff to base.
COPY --from=buildPgSchemaDiff /usr/local/bin/pg-schema-diff /usr/local/bin/pg-schema-diff

COPY ../package.json ./package.json
COPY ../yarn.lock ./yarn.lock

# Install node packages.
RUN yarn install --frozen-lockfile

# Copy the rest of the source files into the image.
COPY ../ ./

# Run the build script.
RUN yarn build

# Use production node environment by default.
ENV NODE_ENV production

RUN chmod +x ./spin_game_backend.sh

CMD ./spin_game_backend.sh
