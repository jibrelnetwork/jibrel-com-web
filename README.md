# Jibrel.com CMS

Jibrel.com CMS for offerings management and public content

## Deployment

Required production run environment variables:

- `JWT_SECRET` = any secret string for session token signing / verifying. There is already a secret in default config, but it is not suitable for production.
- `DATABASE_SSL` (true / false)
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME` = name of the project database
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `PORT` = which port application is launched at
- `PROXY_SSL` (true / false)
- `PROXY_HOST` = proxy host name. All the URLs (links, CORS, etc.) will be generated based on proxy config
- `PROXY_PORT` = proxy port number.

