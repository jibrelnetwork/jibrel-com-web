# Jibrel.com CMS

Jibrel.com CMS for offerings management and public content

## Deployment

Required server run environment variables:

- `NODE_ENV` = `staging` for development and staging server, `production` for production server
- `JWT_SECRET` = any secret string for session token signing / verifying. There is already a secret in default config, but it is not suitable for production.
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME` = name of the project database
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `PORT` = which port application is launched at
- `AWS_S3_REGION`
- `AWS_S3_BUCKET`

Additional environemnt variables available are:

- `AWS_S3_ROOT` = if not specified, `NODE_ENV` value will be used instead
- `AWS_CDN_HOST` = if not specified, default S3 host name will be used

Configurations are stored under [/config/environments](./config/environments). They are named after respective `NODE_ENV` value. So if you pass `NODE_ENV=staging` app will load config files from `/config/environments/staging`. If you pass `NODE_ENV=test` there will be no configuration at all.
