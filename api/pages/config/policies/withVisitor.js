const _ = require('lodash')
const rp = require('request-promise')
const errors = require('request-promise/errors')
const { ACCESS_LEVEL } = require('utils/access')

const log = strapi.log.child({ module: 'pages/policies/withVisitor' })

const ANONYMOUS_VISITOR = {
  isLoggedIn: false,
  isKnown: false,
  access: ACCESS_LEVEL.PUBLIC,
}

module.exports = async (ctx, next) => {
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
    const { data: profile } = await rp({
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
      isKnown: profile.kycStatus === 'verified',
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
}
