'use strict';

const { promisify } = require('util')
const path = require('path')
const fs = require('fs')

const { rgbaToHex } = require('utils/color')

const readFile = promisify(fs.readFile)

module.exports = {
  async version(ctx) {
    const version = await readFile(path.resolve(
      __dirname,
      '../../../version.txt',
    ), 'utf8')

    return ctx.send(version.trim())
  },

  async companyStyles(ctx) {
    const { company } = strapi.services

    const rawData = await company.slug(ctx.params.slug)

    if (!rawData) {
      return ctx.notFound()
    }

    ctx.set('Content-Type', 'text/css')
    ctx.set('Cache-Control', 'no-cache')

    if (!rawData.primary_color) {
      return ctx.send('')
    }

    const primaryColor = rawData.primary_color

    const primaryColorRGB = [
      primaryColor.slice(1, 3),
      primaryColor.slice(3, 5),
      primaryColor.slice(5, 7),
    ].map((hex) => parseInt(hex, 16))

    const colors = {
      sidebar: {
        background: rgbaToHex([...primaryColorRGB, 0.1]),
      },
      button: {
        background: rgbaToHex([...primaryColorRGB, 1]),
        active: {
          background: rgbaToHex([...primaryColorRGB, 0.1]),
          text: rgbaToHex([...primaryColorRGB, 1]),
        },
      },
      tag: {
        background: rgbaToHex([...primaryColorRGB, 0.1]),
        text: rgbaToHex([...primaryColorRGB, 1]),
      },
      link: {
        text: rgbaToHex([...primaryColorRGB, 1]),
      },
    }

    await ctx.send(`
      .offering__terms {
        background-color: ${colors.sidebar.background};
      }
      
      .big-button.--company {
        background: ${colors.button.background};
        border-color: ${colors.button.background};
      }

      .big-button.--company:hover {
        color: ${colors.button.background};
      }

      .big-button.--company:active {
        background: ${colors.button.active.background};
        color: ${colors.button.active.text};
      }
      
      .company-about__tags-item {
        background: ${colors.button.active.background};
        color: ${colors.button.active.text};
      }
      
      .company-hero__video-link:hover {
        color: ${colors.link.text};
      }
      
      .offering-stub {
        background-color: ${colors.sidebar.background};
      }
      
      .small-button.--company {
        background: ${colors.button.background};
        border-color: ${colors.button.background};
      }
      
      .small-button.--company:hover {
        background: #fff;
        color: ${colors.button.background};
      }

      .small-button.--company:active {
        background: ${colors.button.active.background};
        color: ${colors.button.active.text};
      }
      
      a {
        color: ${colors.link.text};
      }
    `)
  },
}
