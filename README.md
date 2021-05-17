# REST API Boilerplate for Node.js in TypeScript
[![Language](https://img.shields.io/badge/Lang-TypeScript-0076C6.svg)](https://github.com/microsoft/TypeScript)
[![Release](https://img.shields.io/github/release/potitoaghilar/node-rest-api-boilerplate.svg)](https://GitHub.com/potitoaghilar/node-rest-api-boilerplate/releases/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/potitoaghilar/node-rest-api-boilerplate/graphs/commit-activity)
[![License](https://img.shields.io/github/license/potitoaghilar/node-rest-api-boilerplate)](https://github.com/potitoaghilar/node-rest-api-boilerplate/blob/master/LICENSE)


A simple REST API boilerplate created using Hapi, Boom, Joiful, Prisma, Pagination, Swagger and OAuth2.

> Warning: for production ready environments change this part as you prefer. This is a simple example, setup of a strong OAuth2 authorization server and advanced configurations are out of the scope of this guide

## Table of contents
- [REST API Boilerplate for Node.js in TypeScript](#rest-api-boilerplate-for-nodejs-in-typescript)
    * [Setup](#setup)
        + [Environment configuration](#environment-configuration)
        + [OAuth2 server setup](#oauth2-server-setup)
        + [Database initialization](#database-initialization)
    * [Prisma client](#prisma-client)
    * [Available endpoints:](#available-endpoints-)
    * [Boilerplate workflow](#boilerplate-workflow)
    * [Token refresh lifecycle](#token-refresh-lifecycle)
    * [Others](#others)
        + [Pull requests and Issues](#pull-requests-and-issues)
        + [TODO](#todo)

## Setup

### Environment configuration

Prepare your development environment:
```bash
$ cp .env.dev .env
```

Or prepare your production environment:
```bash
$ cp .env.prod .env
```

### OAuth2 server setup

Generate OAuth2 server secret:
```bash
$ export LC_CTYPE=C; cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

Save **secret** it in `.env*`.

> Store OAUTH_SECRET otherwise you will lose access to authorization server

Start all docker-compose services with:
```bash
$ docker-compose up -d
```

Remember to stop all services when finished with:
```bash
$ docker-compose down
```

Create your first OAuth client:
```bash
$ docker exec hydra \
  hydra clients create \
    --endpoint http://127.0.0.1:4445/ \
    --id <client-id> \
    --secret <client-secret> \
    --grant-types authorization_code,refresh_token \
    --response-types token,code \
    --callbacks http://localhost:3000/api/oauth/authorize
```

> Replace `<client-id>` and `<client-secret>` with your custom values

Deploy a sample Login & Consent OAuth App:
```bash
$ docker run -d \
  --name hydra-consent \
  -p 9020:3000 \
  --network hydranet \
  -e HYDRA_ADMIN_URL=http://hydra-server:4445 \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  oryd/hydra-login-consent-node:v1.3.2
```

### Database initialization

Initialize database using Prisma migrations:
```bash
$ npx prisma migrate dev --name init
```

Create first user in database:
```bash
$ npm run seed
```

## Prisma client

Execute a Prisma migration in development environment:
```bash
$ npx prisma migrate dev --name init
```

Execute a Prisma migration in production environment:
```bash
$ npx prisma migrate deploy
```

Generate Prisma client (after some changes to Prisma model file):
```bash
$ npx prisma generate
```

To introspect database use Prisma Studio:
```bash
$ npx prisma studio
```

## Available endpoints:

REST API endpoint:
```
http://localhost:3000/api
```

Swagger endpoint:
```
http://localhost:3000/api-docs
```

## Boilerplate workflow

Follow these steps to complete the setup

1. Use commands before to prepare the environment
   
2. Go to swagger endpoint:
```
http://localhost:3000/api-docs#/
```

3. Use default credentials:
```
Username: admin
Password: admin
```

4. Make a `GET` request to `/api/oauth/authenticate`

5. Copy the `authUrl` in the response body and open it in a new browser window

6. Login to sample app with credentials `foo@bar.com` as email, `foobar` as password and give consent

7. After authentication completed, copy the JWT token provided and use it to authorize REST API requests as JWT Bearer token 

## Token refresh lifecycle

In order to prevent access token expiration issues an access token lifecycle has been implemented to refresh it when it expires.
If this situation occurs the current request is authorized anyways but starting from next one you should provide newly generated access token, coming back in the `Authorization` header of the current response.

> This allows full transparency of access token expiration and refresh using the API

## Others

### Pull requests and Issues

Feel free to submit issues and pull requests if you want :smile:

### TODO

- [ ] Write tests
- [ ] Checks other TODOs in code 
