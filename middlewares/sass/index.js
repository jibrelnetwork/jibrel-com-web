const path = require('path')
const _ = require('lodash')
const glob = require('strapi/lib/load/glob')
const scssToCss = require('utils/scss-to-css')

const contentTypes = {
  css: 'text/css',
  map: 'application/json',
}

module.exports = strapi => {
  const log = strapi.log.child({ module: 'middlewares/sass' })

  return {
    async initialize() {
      const { sass: config } = strapi.config.middleware.settings
      const staticPath = path.join(strapi.config.appPath, strapi.config.paths.static)
      const srcPath = path.join(staticPath, strapi.config.scss.src)
      const destPath = path.join(staticPath, strapi.config.scss.dest)

      const scssFiles = await glob('*.scss', {
        cwd: srcPath,
      })
      const availableRequestPaths = scssFiles.reduce((memo, filePath) => {
        memo[`${config.prefix}/${path.basename(filePath, path.extname(filePath))}.css`] = {
          path: path.join(srcPath, filePath),
          type: 'css',
        }
        memo[`${config.prefix}/${path.basename(filePath, path.extname(filePath))}.css.map`] = {
          path: path.join(srcPath, filePath),
          type: 'map',
        }
        return memo
      }, {})
      log.debug({
        msg: 'List of available css paths',
        paths: availableRequestPaths,
      })

      strapi.app.use(async (ctx, next) => {
        if (availableRequestPaths[ctx.request.path]) {
          const source = availableRequestPaths[ctx.request.path]
          const result = await scssToCss(source.path, destPath, srcPath)

          ctx.set('Content-Type', contentTypes[source.type])
          ctx.set('Cache-Control', 'no-cache')
          return ctx.send(result[source.type].toString())
        }

        return next()
      })
    },
  }
}
