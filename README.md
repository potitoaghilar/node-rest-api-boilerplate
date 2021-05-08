## REST API Node Boilerplate

### Base services setup

> Warning: for production ready environments change this part as you prefer. This is a simple example, setting up a strong OAuth2 authorization server. Advanced configurations are out of the scope of this guide

Services spawned in this demo are:
 - `mysql` database
 - `postgresql` database
 - `hydra-migrate` 

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

Create your first client:
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
