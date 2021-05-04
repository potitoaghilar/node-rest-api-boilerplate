## REST API Node Boilerplate

### Configure environement

Set `.env` dev environement:
```bash
$ cp .env.dev .env
```

Set `.env` production environement:
```bash
$ cp .env.prod .env
```

### Initialize database

Start database with:
```bash
$ docker-compose up -d
```

Stop database with:
```bash
$ docker-compose down
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
