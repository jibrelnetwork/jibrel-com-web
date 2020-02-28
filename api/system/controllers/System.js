'use strict';

const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const rp = require('request-promise')
const errors = require('request-promise/errors')
const _ = require('lodash')

const {
  rgbaToHex,
  hexToRgb,
} = require('utils/color')

const readFile = promisify(fs.readFile)

const getVersionStatus = async () => {
  try {
    return {
      version: (await readFile(path.resolve(
        __dirname,
        '../../../version.txt',
      ), 'utf8')).trim(),
    }
  } catch (error) {
    strapi.log.error(error)

    return {
      healthy: false,
      version: 'unavailable',
    }
  }
}

const getDBHealth = async () => {
  try {
    await strapi.query('company').count()
    return {
      db: 'ok',
    }
  } catch (error) {
    strapi.log.error(error)

    return {
      healthy: false,
      db: 'unavailable',
    }
  }
}

const getAPIHealth = async () => {
  try {
    await rp({
      baseUrl: _.get(strapi.config, 'api.baseUrl'),
      url: '/healthcheck',
      headers: {
        'User-Agent': _.get(strapi.config, 'api.userAgent'),
      },
      json: true,
    })
    return {
      api: 'ok',
    }
  } catch (error) {
    if (error instanceof errors.StatusCodeError && error.statusCode === 500) {
      strapi.log.warn(error)

      return {
        api: 'failing',
      }
    } else {
      strapi.log.error(error)

      return {
        healthy: false,
        api: 'unavailable',
      }
    }
  }
}

module.exports = {
  async version(ctx) {
    const version = await readFile(path.resolve(
      __dirname,
      '../../../version.txt',
    ), 'utf8')

    return ctx.send(version.trim())
  },

  async healthcheck(ctx) {
    const initial = {
      healthy: true,
    }

    const checks = await Promise.all([
      getVersionStatus(),
      getDBHealth(),
      getAPIHealth(),
    ])

    const result = _.extend(initial, ...checks)

    if (result.healthy) {
      return ctx.send(result)
    }

    ctx.response.status = 424
    ctx.response.body = result
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
      return ctx.send('/* Primary color not set, using default styles */')
    }

    const primaryColorRGB = hexToRgb(rawData.primary_color || '#003dc6')

    const colors = {
      status: {
        background: rgbaToHex([...primaryColorRGB, 1]),
      },
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

      .offering-status.--waitlist {
        background-color: ${colors.status.background};
      }

      .offering-status .offering-status__button {
        color: ${colors.status.background};
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

  async gaTrack(ctx) {
    ctx.set('Content-Type', 'application/javascript')
    ctx.set('Cache-Control', 'public, max-age=31536000, immutable')

    await ctx.send(`
      window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
      ga('create', '${ctx.query.id}', 'auto');
      ga('send', 'pageview');
    `)
  },
}
