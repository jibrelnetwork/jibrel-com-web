'use strict';

const _ = require('lodash')
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async list(ctx) {
    const lang = ctx.getLocaleFromUrl()
    const dir = lang === 'ar'
      ? 'rtl'
      : 'ltr'

    const rawOfferings = await strapi.query('primaryoffering').find({
      active: true,
      lang,
    })

    const offerings = rawOfferings
      .map((offering) => {
        const o = sanitizeEntity(
          offering,
          { model: strapi.models.primaryoffering }
        )
        o.preview_bg_img = _.get(o, 'preview_bg_img.url', '#')
        o.logo_img = _.get(o, 'logo_img.url', '#')
        o.url = `/${o.path}`

        return o
      })

    await ctx.render('index.hbs', {
      lang,
      dir,
      offerings,
    })
  }
}
