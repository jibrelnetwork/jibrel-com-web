const path = require('path')
const _ = require('lodash')
const views = require('koa-views')
const glob = require('strapi/lib/load/glob')

const markdownIt = require('markdown-it')

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
          breaks: false,
          typographer: true,
          modifyToken: function (token) {
            switch (token.type) {
              case 'image': {
                token.attrObj.src = replaceS3UrlWithCDN(token.attrObj.src)
              }
            }
          },
        })
        .use(require('utils/markdown-it-plugin-adjust-heading-levels'), { minLevel: 3 })
        .use(require('markdown-it-modify-token'))
        .use(require('markdown-it-container'), 'tagline', {
          render: function (tokens, idx) {
            const matches = tokens[idx].info.trim().match(/^tagline\s+(.*)$/)
            const style = matches && matches[1]
              ? `style="text-decoration-color: ${matches[1]};"`
              : ''

            if (tokens[idx].nesting === 1) {
              // opening tag
              return `<div class="tagline" ${style}>`
            } else {
              // closing tag
              return '</div>\n'
            }
          }
        })
        .use(require('markdown-it-container'), 'team')

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
          (ctx, next) =>
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
                      md.render(content || ''),
                    __: (key, ...params) =>
                      ctx.i18n.__(key, ...params.slice(0, -1)),
                    isCurrentPageId: (id, options) =>
                      id === _.get(ctx, 'state.page.id')
                        ? options.fn(this)
                        : '',
                    // Refactored from this StackOverflow response: https://stackoverflow.com/a/31632215
                    and: (...args) =>
                      args.slice(0, -1).every(Boolean),
                    or: (...args) =>
                      args.slice(0, -1).some(Boolean),
                  },

                  partials,

                  cache: false
                }
              }
            )(ctx, next)
        )
      } catch (err) {
        log.error('Could not load list of partials from filesystem')
        log.error(err)
      }
    },
  }
}
