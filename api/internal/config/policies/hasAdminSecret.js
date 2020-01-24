const _ = require('lodash')

module.exports = async (ctx, next) => {
  const secret = ctx.headers['x-admin-secret']
  if (!secret || secret !== _.get(strapi.config, 'internal.secret')) {
    return ctx.forbidden()
  }

  return next()
}
