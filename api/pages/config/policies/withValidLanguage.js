module.exports = async (ctx, next) => {
  const { i18n } = ctx
  const { lang } = ctx.params

  if (!lang) {
    // FIXME: should instead use ctx.i18n.locale filled also from cookie
    return ctx.redirect(`/${i18n.defaultLocale}${ctx.originalUrl}`)
  }

  if (!i18n.locales[lang]) {
    // FIXME: should be not found?
    return ctx.redirect(`/${i18n.defaultLocale}${ctx.originalUrl}`)
  }

  return next()
}
