const createTitle = (title) => title
  ? `${title} • Jibrel.com`
  : 'Jibrel.com'

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/page' })

  return {
    async initialize() {
      strapi.app.use(
        async (ctx, next) => {
          const lang = ctx.getLocaleFromUrl()
          const dir = lang === 'ar'
            ? 'rtl'
            : 'ltr'

          ctx.createTitle = createTitle

          ctx.locals = {
            page: {
              lang,
              dir,
              title: createTitle(),
            }
          }

          return next()
        }
      )
    },
  }
}
