const URL_FIRST_SLASH_POS = 1

module.exports = async (ctx, next) => {
  const {
    i18n,
    params,
    originalUrl,
  } = ctx

  const { lang } = params

  if (!lang) {
    // FIXME: should instead use ctx.i18n.locale filled also from cookie
    return ctx.redirect(`/${i18n.defaultLocale}${originalUrl}`)
  }

  if (!i18n.locales[lang]) {
    // FIXME: should be not found?

    const langSlashPos = originalUrl.indexOf('/', URL_FIRST_SLASH_POS)
    const urlWithoutLang = (langSlashPos !== -1) ? originalUrl.substr(langSlashPos) : ''

    return ctx.redirect(`/${i18n.defaultLocale}${urlWithoutLang}`)
  }

  return next()
}
