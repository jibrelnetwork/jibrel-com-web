const _ = require('lodash')
const rp = require('request-promise')
const errors = require('request-promise/errors')
const { ACCESS_LEVEL } = require('utils/access')

const ANONYMOUS_VISITOR = {
  isLoggedIn: false,
  kyc: {
    pending: false,
    verified: false,
  },
  access: ACCESS_LEVEL.PUBLIC,
}

function getRoutesByPaths(routes) {
  return _.keyBy(routes, 'path')
}

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/visitor' })

  return {
    async initialize() {
      // list all routes for Pages controller and convert it to hashmap
      const pageRoutes = getRoutesByPaths(
        strapi.config.routes.filter((route) =>
          route.handler && route.handler.startsWith('Pages')
        ),
      )

      const externalAPIRoutes = getRoutesByPaths(strapi.api.external.config.routes)
      const routeMatched = (path) => !!pageRoutes[path] || !!externalAPIRoutes[path]

      strapi.app.use(async (ctx, next) => {
        // match router handling layers for request
        const matched = strapi.router.match(ctx.request.path, ctx.request.method)
        // if there is no layer that looks like one of Pages controller, skip this middleware
        if (!matched.pathAndMethod.find((match) => routeMatched(match.path))) {
          return next()
        }

        // else fill state.visitor property with current visitor params
        if (!ctx.cookies.get('sessionid')) {
          log.trace('Visitor recognized as anonymous')
          _.set(ctx, 'state.visitor', ANONYMOUS_VISITOR)

          return next()
        }

        const start = +new Date()

        try {
          log.trace({
            msg: 'Request profile API',
            baseUrl: _.get(strapi.config, 'api.baseUrl'),
            url: '/v1/user/profile',
          })
          const {data: profile} = await rp({
            baseUrl: _.get(strapi.config, 'api.baseUrl'),
            url: '/v1/user/profile',
            headers: {
              'Cookie': `sessionid=${ctx.cookies.get('sessionid')}`,
              'User-Agent': _.get(strapi.config, 'api.userAgent'),
            },
            json: true,
          })

          log.debug(`Response from profile API (${(new Date()) - start} ms)`)
          log.trace({
            msg: 'User profile parameters',
            uuid: profile.uuid,
            kycStatus: profile.kycStatus,
          })
          _.set(ctx, 'state.visitor', {
            isLoggedIn: true,
            kyc: {
              pending: profile.kycStatus === 'pending',
              verified: profile.kycStatus === 'verified',
            },
            access: profile.kycStatus === 'verified'
              ? ACCESS_LEVEL.VERIFIED
              : ACCESS_LEVEL.REGISTERED,
          })

          return next()
        } catch (err) {
          if (err instanceof errors.StatusCodeError && err.statusCode === 403) {
            log.debug(`No profile found (${(new Date()) - start} ms)`)
            _.set(ctx, 'state.visitor', ANONYMOUS_VISITOR)
            return next()
          }

          throw err
        }
      })
    },
  }
}
