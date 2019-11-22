'use strict'

const { sanitizeEntity } = require('strapi-utils')

module.exports = {
  prepare (data) {
    const tag = sanitizeEntity(
      data,
      { model: strapi.models.tag }
    )

    tag._prepared = true

    return tag
  },

  localize (i18n, data) {
    // data preparation is prerequisite for localization
    const tag = data._prepared
      ? data
      : this.prepare(data)

    const { locale } = i18n
    const lang = locale.split('-')[0]

    tag.permalink = `/${locale}/tags/${tag.slug}`

    return tag
  },
}
