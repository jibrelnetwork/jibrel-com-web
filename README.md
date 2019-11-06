# Jibrel.com CMS

Jibrel.com CMS for offerings management and public content

## Deployment

Required production run environment variables:

- `NODE_ENV` = `staging` for development and staging server, `production` for production server
- `JWT_SECRET` = any secret string for session token signing / verifying. There is already a secret in default config, but it is not suitable for production.
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME` = name of the project database
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `PORT` = which port application is launched at
- `PROXY_HOST` = proxy host name. All the URLs (links, CORS, etc.) will be generated based on proxy config
- `PROXY_PORT` = proxy port number.

Configurations are stored under [/config/environments](./config/environments). They are named after respective `NODE_ENV` value. So if you pass `NODE_ENV=staging` app will load config files from `/config/environments/staging`. If you pass `NODE_ENV=test` there will be no configuration at all.
