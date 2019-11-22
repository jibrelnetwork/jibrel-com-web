const DEFAULT_LANGUAGE = 'en'
const LANGUAGES_AVAILABLE = {
  en: true
}

module.exports = async (ctx, next) => {
  const { i18n } = ctx
  const { locale } = i18n

  if (!locale) {
    return ctx.redirect(`/${i18n.defaultLocale}`)
  }

  if (!i18n.locales[locale]) {
    // FIXME: should be not found?
    return ctx.redirect(`/${i18n.defaultLocale}`)
  }

  return next()
}
