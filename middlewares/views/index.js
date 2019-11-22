const path = require('path')
const _ = require('lodash')
const views = require('koa-views')
const glob = require('strapi/lib/load/glob')

const markdownIt = require('markdown-it')
const adjustHeadingLevels = require('../../utils/markdown-it-plugin-adjust-heading-levels')
const modifyToken = require('markdown-it-modify-token')

const removeExtension = (str) => str.split('.').slice(0, -1).join('.')

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/views' })

  return {
    async initialize() {
      const assetsPath = _.get(strapi.config, 'currentEnvironment.request.router.prefix', '')
      const viewsDir = path.resolve(strapi.config.appPath, strapi.config.paths.views)
      const cdnHost = _.get(strapi.config, 'currentEnvironment.awsS3.cdnHost', '')

      // accepts file or s3 url, returns url to cdn
      const replaceS3UrlWithCDN = (strOrObject) => {
        const str = strOrObject
          ? (strOrObject.url || strOrObject)
          : '#'

        if (!cdnHost) {
          return str
        }

        const url = new URL(str, cdnHost)
        url.host = cdnHost

        return url.toString()
      }

      const md = markdownIt({
          html: true,
          breaks: true,
          typographer: true,
          modifyToken: function (token) {
            switch (token.type) {
              case 'image': {
                token.attrObj.src = replaceS3UrlWithCDN(token.attrObj.src)
              }
            }
          },
        })
        .use(adjustHeadingLevels, { minLevel: 3 })
        .use(modifyToken)

      try {
        const partialsList = await glob(
          '@(layouts|partials)/*.hbs',
          { cwd: viewsDir }
        )

        const partials = partialsList.reduce((memo, file) => {
          const id = removeExtension(file)
          memo[id] = `./${id}`
          return memo
        }, {})

        log.debug({ partials }, 'Prepared list of partials from filesystem')

        strapi.app.use(
          views(
            viewsDir,
            {
              map: { hbs: 'handlebars' },
              options: {
                helpers: {
                  asset: (str) => assetsPath + str,
                  cdn: replaceS3UrlWithCDN,
                  // preview markdown project description as html
                  projectMD: (content) =>
                    md.render(content || '')
                },

                partials,

                cache: false
              }
            }
          )
        )
      } catch (err) {
        log.error('Could not load list of partials from filesystem')
        log.error(err)
      }
    },
  }
}
