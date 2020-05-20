const rp = require('request-promise')
const errors = require('request-promise/errors')
const _ = require('lodash')

module.exports = async function getAPIHealth() {
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
        healthy: false,
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
