# Gamfi Near Backend

## Getting started

to start you need to put these environment variables

- DATABASE_URL
- SECRET_KEY
- LOG_FORMAT
- LOG_DIR
- ORIGIN
- CREDENTIALS
- PORT
  and then run these commands

```
npm i
docker compose up -d
npm run prisma:init
npm run prisma:migrate
npm run dev
```
