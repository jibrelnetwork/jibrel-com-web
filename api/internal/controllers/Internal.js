'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { company } = require('utils/migration')

const log = strapi.log.child({ module: 'internal/controllers/company' })

const MD_IMG_RE = /!\[[^\]]+\]\(([^\)]+)\)/g

module.exports = {
  async export(ctx) {
    log.info({
      msg: 'Export request',
      ip: ctx.request.ip,
      ips: ctx.request.ips,
    })

    const companies = await strapi.services.company.listAll()

    return ctx.send({
      version: company.version,
      environment: strapi.config.environment,
      data: companies,
    })
  },

  async import(ctx) {
    log.info({
      msg: 'Import request',
      ip: ctx.request.ip,
      ips: ctx.request.ips,
    })
    log.trace({
      msg: 'Import data',
      query: ctx.query,
      body: ctx.request.body,
    })

    const duplicateStrategy = ctx.query.duplicateStrategy || 'ignore'
    const replaceContentImgUrls = ctx.query.replaceContentImgUrls === '1'

    const source = ctx.request.body

    if (source.version > company.version) {
      log.error({
        msg: `Could not import older version! Data: ${source.version}, current: ${company.version}`,
      })
      return ctx.badRequest()
    } else if (source.version === company.version) {
      log.debug({
        msg: 'No transformation required, writing to db as is',
      })

      if (replaceContentImgUrls && source.environment) {
        source.data = source.data.map((c) => ({
          ...c,
          translations: c.translations.map((translation) => ({
            ...translation,
            content: translation.content.map((block) => ({
              ...block,
              data: block.type === 'markdown'
                ? block.data.replace(
                  MD_IMG_RE,
                  (found, url) => found.replace(
                    url,
                    url.replace(`/${source.environment}/`, `/${strapi.config.environment}/`)
                  ),
                )
                : block.data
            })),
          }))
        }))
      }

      const updated = await Promise.all(
        source.data.map(
          (c) =>
            strapi.services.company.import(c, {
              duplicateStrategy,
            })
        )
      )
      return ctx.send({
        updated,
      })
    } else {
      log.error({
        msg: `Transformation from version ${source.version} to ${company.version} is not implemented yet`,
      })
      return ctx.notImplemented()
    }
  },
}
