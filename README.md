# Gamfi Near Backend

The backend of neargami.com

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
yarn
docker compose up -d
yarn run prisma:init
yarn run prisma:migrate
yarn run dev
```

# License

MIT
