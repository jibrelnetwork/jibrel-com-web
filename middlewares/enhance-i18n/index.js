const _ = require('lodash')
const {
  format,
  formatDistance,
  formatDistanceStrict,
  formatDistanceToNow,
  formatRelative,
} = require('date-fns')
const dateLocales = require('date-fns/locale')

const dateLocalesProxy = {
  ...dateLocales,
  en: dateLocales.enGB,
}

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/enhance-i18n' })

  return {
    async initialize() {
      strapi.app.use(
        (ctx, next) => {
          const {
            locale,
            defaultLocale,
          } = ctx.i18n
          const defaultDateOptions = {
            locale: _.get(dateLocalesProxy, locale, dateLocales[defaultLocale])
          }

          if (!_.has(dateLocalesProxy, locale)) {
            log.warn(`No date-fns locale available for "${locale}" locale. Using default "${defaultLocale}" instead.`)
          }

          _.set(ctx.i18n, 'date', {
            format: (date, formatString, options) => format(
              date,
              formatString,
              _.defaults(options, defaultDateOptions),
            ),
            formatDistance: (date, baseDate, options) => formatDistance(
              date,
              baseDate,
              _.defaults(options, defaultDateOptions),
            ),
            formatDistanceStrict: (date, baseDate, options) => formatDistanceStrict(
              date,
              baseDate,
              _.defaults(options, defaultDateOptions),
            ),
            formatDistanceToNow: (date, options) => formatDistanceToNow(
              date,
              _.defaults(options, defaultDateOptions),
            ),
            formatRelative: (date, baseDate, options) => formatRelative(
              date,
              baseDate,
              _.defaults(options, defaultDateOptions),
            ),
          })

          _.set(ctx.i18n, 'user', {
            currency: 'USD',
          })

          return next()
        }
      )
    },
  }
}
