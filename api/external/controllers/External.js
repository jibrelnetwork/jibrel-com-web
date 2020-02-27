'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const {
  rgbaToHex,
  hexToRgb,
} = require('utils/color')

function getCompanyData(i18n, company) {
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
  } = strapi.services.company.localize(i18n, company)

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
  async companiesList(ctx) {
    const {
      company,
      offering,
    } = strapi.services

    const raw = await company.list()
    const offerings = await Promise.all(raw.map(i => !i ? null : offering.list(i.slug)))

    return {
      data: raw.map((item, index) => !item ? null : getCompanyData(ctx.i18n, {
        ...item,
        offerings: offerings[index],
      })),
    }
  },

  async companiesSlug(ctx) {
    const {
      company,
      offering,
    } = strapi.services

    const [raw, offerings] = await Promise.all([
      company.slug(ctx.params.slug),
      offering.list(ctx.params.slug),
    ])

    return {
      data: !raw ? null : getCompanyData(ctx.i18n, {
        ...raw,
        offerings,
      }),
    }
  },
}
