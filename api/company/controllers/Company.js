'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {
  rgbaToHex,
  hexToRgb,
} = require('utils/color')

module.exports = {
  async slug(ctx) {
    const raw = await strapi.services.company.slug(ctx.params.slug)
    const data = strapi.services.company.localize(ctx.i18n, raw)

    if (!data) {
      return ctx.notFound()
    }

    const {
      slug,
      title,
      location,
      permalink,
      translation,
      hero_img: hero,
      logo_img: logo,
      primary_color: primary,
      current_offering: currentOffering,
    } = data

    const primaryColorRGB = hexToRgb(primary || '#003dc6')

    return {
      data: {
        slug,
        title,
        location,
        permalink,
        currentOffering,
        tagline: translation.tagline,
        color: {
          primary,
          background: rgbaToHex([...primaryColorRGB, 0.1]),
        },
        hero: hero
          ? hero.url
          : null,
        logo: logo
          ? logo.url
          : null,
      },
    }
  },
}
