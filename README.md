## REST API Node Boilerplate

### Databases initialization

We have 2 databases:
 - `mysql` database for our main app
 - `postgresql` database for authorization server

Start `mysql` database with:
```bash
$ docker-compose up -d
```

Stop `mysql` database with:
```bash
$ docker-compose down
```

### OAuth2 authorization server (POC guide)

> Warning: for production ready environments change this part as you prefer. This is a simple example, setting up a strong OAuth2 authorization server. Advanced configurations are out of the scope of this guide 

Firstly create a docker network:
```bash
$ docker network create hydranet
```

In order to deploy OAuth2 server deploy a PostgreSQL:
```bash
$ docker run \
  --network hydranet \
  --name hydra-postgres \
  -e POSTGRES_USER=hydra \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=hydra \
  -d postgres:9.6
```

set environmental variables:
```bash
$ export SECRETS_SYSTEM=$(export LC_CTYPE=C; cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
$ export DSN=postgres://hydra:secret@hydra-postgres:5432/hydra?sslmode=disable
```

> Store SECRETS_SYSTEM otherwise you will lose access to authorization server

See all environmental variables supported by Hydra:
```bash
$ docker run -it --rm --entrypoint hydra oryd/hydra:v1.10.2 help serve
```

Start database migrations:
```bash
$ docker run -it --rm \
  --network hydranet \
  oryd/hydra:v1.10.2 \
  migrate sql --yes $DSN
```

Run server:
```bash
$ docker run -d \
  --name hydra-server \
  --network hydranet \
  -p 4444:4444 \
  -p 4445:4445 \
  -e SECRETS_SYSTEM=$SECRETS_SYSTEM \
  -e DSN=$DSN \
  -e URLS_SELF_ISSUER=http://localhost:4444/ \
  -e URLS_CONSENT=http://localhost:9020/consent \
  -e URLS_LOGIN=http://localhost:9020/login \
  oryd/hydra:v1.10.2 serve all \
  --dangerous-force-http
```

Check if it is running:
```bash
$ docker logs hydra-server
```

Create your first client:
```bash
$ docker exec hydra-server \
  hydra clients create \
    --endpoint http://127.0.0.1:4445/ \
    --id KoxHwD6t027ZyPKoeRZuICc3BQO3xP1d \
    --secret vZdHwIoePnvC1LN9nepnEX478FRuzS8iYsYcRcni2uo0SWtF-WyzzfZvQC51HstX \
    --grant-types authorization_code,refresh_token \
    --response-types token,code \
    --callbacks http://localhost:3000/api/oauth/authorize
```

Deploy a sample Login & Consent App:
```bash
$ docker run -d \
  --name hydra-consent \
  -p 9020:3000 \
  --network hydranet \
  -e HYDRA_ADMIN_URL=http://hydra-server:4445 \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  oryd/hydra-login-consent-node:v1.3.2
```

Create first user:
```bash
$ npm run seed
```

### Configure environement

Set `.env` dev environement:
```bash
$ cp .env.dev .env
```

Set `.env` production environement:
```bash
$ cp .env.prod .env
```

### Prisma client

Prisma migration in dev
```bash
$ npx prisma migrate dev --name init
```

Prisma migration in prod
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

### TODO

> Write tests
