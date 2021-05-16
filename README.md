# REST API Boilerplate for Node.js in TypeScript

#### A simple REST API boilerplate created using Hapi, Boom, Joiful, Pagination, Swagger and OAuth2.

### Base services setup

> Warning: for production ready environments change this part as you prefer. This is a simple example, setup of a strong OAuth2 authorization server and advanced configurations are out of the scope of this guide

Generate OAuth2 server secret:
```bash
$ export LC_CTYPE=C; cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

Save it in `.env*`

> Store SECRETS_SYSTEM otherwise you will lose access to authorization server

Start all services with:
```bash
$ docker-compose up -d
```

Stop  all services with:
```bash
$ docker-compose down
```

Create your first OAuth client:
```bash
$ docker exec hydra \
  hydra clients create \
    --endpoint http://127.0.0.1:4445/ \
    --id KoxHwD6t027ZyPKoeRZuICc3BQO3xP1d \
    --secret vZdHwIoePnvC1LN9nepnEX478FRuzS8iYsYcRcni2uo0SWtF-WyzzfZvQC51HstX \
    --grant-types authorization_code,refresh_token \
    --response-types token,code \
    --callbacks http://localhost:3000/api/oauth/authorize
```

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

Create first user in database:
```bash
$ npm run seed
```

### Configure environment

Set `.env` dev environment:
```bash
$ cp .env.dev .env
```

Set `.env` production environment:
```bash
$ cp .env.prod .env
```

### Prisma client

Prisma migration in dev:
```bash
$ npx prisma migrate dev --name init
```

Prisma migration in prod:
```bash
$ npx prisma migrate deploy
```

Generate Prisma client:
```bash
$ npx prisma generate
```

### Prisma Studio

To introspect database use:
```bash
$ npx prisma studio
```

### Endpoints:

REST API endpoint:
```
http://localhost:3000/api
```

REST API endpoint:
```
http://localhost:3000/api
```

### Workflow

Follow these steps to complete the setup

1. Prepare environment:
```bash
$ cp .env.dev .env
$ docker-compose up -d
$ npx prisma migrate dev --name init
$ npm run seed
$ npm run dev
```

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

### Token refresh lifecycle

In order to prevent access token expiration issues an access token lifecycle has been implemented to refresh it when it expires.
If this situation occurs the current request is authorized anyways but starting from next one you should provide newly generated access token, coming back in the `Authorization` header of the current response.

> This allows full transparency of access token expiration and refresh to end-user using the API

### Pull requests and Issues

Feel free to submit issues and pull requests if you want :smile:

### TODO

- [ ] Write tests
- [ ] Checks other TODOs in code 
