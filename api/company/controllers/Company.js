'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { rgbaToHex } = require('utils/color')

module.exports = {
  async slug(ctx) {
    const data = await strapi.services.company.slug(ctx.params.slug)

    if (!data) {
      return ctx.notFound()
    }

    const primaryColor = data.primary_color

    const primaryColorRGB = [
      primaryColor.slice(1, 3),
      primaryColor.slice(3, 5),
      primaryColor.slice(5, 7),
    ].map((hex) => parseInt(hex, 16))

    return {
      data: {
        slug: data.slug,
        title: data.title,
        color: {
          primary: data.primary_color,
          background: rgbaToHex([...primaryColorRGB, 0.1]),
        },
        logo: data.logo_img.url,
      },
    }
  },
}
