const _ = require('lodash')

const RTL_LANG_CODES = ['ar', 'ara', 'arc', 'ae', 'ave', 'egy', 'he', 'heb', 'nqo', 'pal', 'phn', 'sam', 'syc', 'syr', 'fa', 'per', 'fas', 'ku', 'kur', 'ur', 'urd']

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/page-meta' })

  return {
    async initialize() {
      strapi.app.use(
        (ctx, next) => {
          _.set(ctx, 'state.env.GOOGLE_MAPS_API_KEY', process.env.GOOGLE_MAPS_API_KEY)
          _.set(ctx, 'state.env.FRONTEND_ROOT_DOMAIN_NAME', process.env.FRONTEND_ROOT_DOMAIN_NAME)

          _.set(ctx, 'state.global.year', (new Date()).getFullYear())
          _.set(ctx, 'state.page.lang', ctx.i18n.locale)
          _.set(ctx,
            'state.page.dir',
            RTL_LANG_CODES.indexOf(ctx.i18n.locale) >= 0
              ? 'rtl'
              : 'ltr',
          )

          ctx.app.createPageTitle = (...values) => {
            if (values.length === 0) {
              return ctx.i18n.__('meta.website.title.empty')
            }

            return ctx.i18n.__('meta.website.title.template', ...values)
          }

          _.set(ctx,
            'state.page.title',
            ctx.app.createPageTitle(ctx.i18n.__('meta.website.title.default')),
          )

          _.set(ctx,
            'state.page.description',
            ctx.i18n.__('meta.website.description'),
          )

          return next()
        }
      )
    },
  }
}
