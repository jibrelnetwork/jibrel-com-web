# Jibrel platform CMS

Jibrel platform CMS for offerings management and public content

## Deployment

Required server run environment variables:

- `NODE_ENV` = `develop` for development server, `stage` for staging server, `production` for production server
- `INTERNAL_SECRET` = any secret string for session token signing / verifying. There is already a secret in default config, but it is not suitable for production.
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME` = name of the project database
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `PORT` = which port application is launched at
- `AWS_S3_REGION`
- `AWS_S3_BUCKET`
- `API_BASE_URL` = base url to access backend API. For example, `https://api.tokenize.jibrel.network` for production
- `API_AUTH_TOKEN` = bearer auth token to use when accessing private backend API methods
- `ORIGIN_SELF` = full origin (`schema://host:port`) for server to be deployed to; `https://tokenize.jibrel.network` for production

Additional environment variables available are:

- `AWS_S3_ROOT` = root directory for S3 storage, by default is empty
- `AWS_CDN_HOST` = if not specified, default S3 host name will be used
- `GOOGLE_MAPS_API_KEY` = if not specified, Google Maps integrations won't work
- `GOOGLE_ANALYTICS_ID` = if not specified, Google Analytics integrations won't work
- `CORS_ORIGINS` = additional CORS origins that need to have access to CMS API. If specifying a list, it must be comma-separated
- `ORIGIN_ID` = override origin (`schema://host:port`) for id subdomain, used for links, by default will be `id.` + `ORIGIN_SELF`
- `ORIGIN_INVESTOR` = override origin (`schema://host:port`) for investor subdomain, used for links, by default will be `investor.` + `ORIGIN_SELF`
- `ORIGIN_COMPANY` = override origin (`schema://host:port`) for company subdomain, used for links, by default will be `company.` + `ORIGIN_SELF`
- `HOSTNAME_SHARED` = override hostname (`host:port`) for shared cookies domain, by default will be `.` + `ORIGIN_SELF`

Configurations are stored under [/config/environments](./config/environments). They are named after respective `NODE_ENV` value. So if you pass `NODE_ENV=stage` app will load config files from `/config/environments/stage`. If you pass `NODE_ENV=test` there will be no configuration at all.
