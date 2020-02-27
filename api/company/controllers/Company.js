'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {
  rgbaToHex,
  hexToRgb,
} = require('utils/color')

function getCompanyData(company) {
  const {
    slug,
    title,
    location,
    permalink,
    translation,
    logo_img: logo,
    primary_color: primary,
    preview_bg_img: preview,
    current_offering: currentOffering,
  } = company

  const primaryColorRGB = hexToRgb(primary || '#003dc6')

  return {
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
    logo: logo
      ? logo.url
      : null,
    preview: preview
      ? preview.url
      : null,
  }
}

module.exports = {
  async list(ctx) {
    const raw = await strapi.services.company.list()

    return {
      data: raw.map((item) => {
        const data = strapi.services.company.localize(ctx.i18n, item)

        return getCompanyData(data)
      }),
    }
  },

  async slug(ctx) {
    const raw = await strapi.services.company.slug(ctx.params.slug)
    const data = strapi.services.company.localize(ctx.i18n, raw)

    if (!data) {
      return ctx.notFound()
    }

    return {
      data: getCompanyData(data),
    }
  },
}
