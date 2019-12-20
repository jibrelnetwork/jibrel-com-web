const _ = require('lodash')

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/user-meta' })

  return {
    async initialize() {
      strapi.app.use(
        (ctx, next) => {
          _.set(ctx, 'state.user', {
            isKnown: false,
          })

          return next()
        }
      )
    },
  }
}
