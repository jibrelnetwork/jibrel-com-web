const path = require('path')
const _ = require('lodash')
const views = require('koa-views')
const glob = require('strapi/lib/load/glob')

const removeExtension = (str) => str.split('.').slice(0, -1).join('.')

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/views' })

  return {
    async initialize() {
      const assetsPath = _.get(strapi.config, 'currentEnvironment.request.router.prefix', '')
      const viewsDir = path.resolve(strapi.config.appPath, strapi.config.paths.views)

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
                  asset: (str) => assetsPath + str
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
