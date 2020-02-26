'use strict';
const path = require('path')
const glob = require('strapi/lib/load/glob')
const scssToCss = require('utils/scss-to-css')
const fs = require('fs')
const { promisify } = require('util')

const writeFile = promisify(fs.writeFile)

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/configurations/configurations.html#bootstrap
 */

const PUBLIC_ROLE_ID = 2

module.exports = async () => {
  const log = strapi.log.child({ module: 'bootstrap' })

  // fill origins if they are not set
  const self = new URL(strapi.config.origin.self)
  const prefixes = ['id', 'investor', 'company']
  prefixes.forEach((prefix) => {
    if (strapi.config.origin[prefix] === '') {
      const prefixUrl = new URL('', self)
      prefixUrl.hostname = `${prefix}.${self.hostname}`
      strapi.config.origin[prefix] = prefixUrl.origin
    }
  })

  // fill domains if they are not set
  if (strapi.config.hostname.shared === '') {
    strapi.config.hostname.shared = `.${self.hostname}`
  }

  // Enable public access to some controllers on init
  await strapi.plugins['users-permissions'].services.userspermissions
    .updateRole(PUBLIC_ROLE_ID, {
      permissions: {
        application: {
          controllers: {
            company: {
              list: {
                enabled: 1,
              },
              slug: {
                enabled: 1,
              },
            },
            pages: {
              noop: {
                enabled: 1,
              },
              notFound: {
                enabled: 1,
              },
              internalError: {
                enabled: 1,
              },
              about: {
                enabled: 1,
              },
              invest: {
                enabled: 1,
              },
              raise: {
                enabled: 1,
              },
              main: {
                enabled: 1,
              },
              company: {
                enabled: 1,
              },
              static: {
                enabled: 1,
              },
              logout: {
                enabled: 1,
              },
            },
            system: {
              version: {
                enabled: 1,
              },
              companyStyles: {
                enabled: 1,
              },
              gaTrack: {
                enabled: 1,
              },
            },
            internal: {
              import: {
                enabled: 1,
              },
              export: {
                enabled: 1,
              },
            },
          },
        },
      },
    })

  // if there is S3 config for current environment, start with it
  if (strapi.config.currentEnvironment.awsS3) {
    const s3Config = strapi.config.currentEnvironment.awsS3

    await strapi
      .store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'upload',
      })
      .set({
        key: 'provider',
        value: {
          enabled: true,
          provider: 'aws-s3',
          region: s3Config.region,
          public: s3Config.public,
          private: s3Config.private,
          bucket: s3Config.bucket,
          root: s3Config.root,
        }
      })
  }

  if (strapi.config.currentEnvironment.security.cors.enabled === true) {
    const { origin: initialOrigin } = strapi.config.middleware.settings.cors
    const initialOriginArray = Array.isArray(initialOrigin)
      ? initialOrigin
      : initialOrigin.split(/\s*,\s*/)

    const allowedOrigin = new Set([
      ...initialOriginArray,
      strapi.config.origin.self,
      strapi.config.origin.id,
      strapi.config.origin.investor,
      strapi.config.origin.company,
    ])

    allowedOrigin.delete('')

    strapi.config.middleware.settings.cors.origin = [...allowedOrigin]
  }

  if (strapi.config.environment !== 'development') {
    const staticPath = path.join(strapi.config.appPath, strapi.config.paths.static)
    const srcPath = path.join(staticPath, strapi.config.scss.src)
    const destPath = path.join(staticPath, strapi.config.scss.dest)
    const scssFiles = await glob('*.scss', {
      cwd: srcPath,
      absolute: true,
    })

    await Promise.all(scssFiles.map(
      (filepath) => scssToCss(filepath, destPath, srcPath)
        .then((result) => {
          return Promise.all([
            writeFile(
              path.join(destPath, result.names.css),
              result.css.toString(),
              'utf8',
            )
              .then(() => {
                log.info({
                  msg: `Built file ${path.join(strapi.config.scss.dest, result.names.css)}`,
                  src: filepath,
                })
              }),
            writeFile(
              path.join(destPath, result.names.map),
              result.map.toString(),
              'utf8',
            )
              .then(() => {
                log.info({
                  msg: `Built file ${path.join(strapi.config.scss.dest, result.names.map)}`,
                  src: filepath,
                })
              }),
          ])
        })
    ))
  }
}
