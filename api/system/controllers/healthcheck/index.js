const _ = require('lodash')

module.exports = async function healthcheck(ctx) {
  const initial = {
    healthy: true,
  }

  const checks = await Promise.all([
    require('./getVersion')(),
    require('./getUptime')(),
    require('./getDBHealth')(),
    require('./getAPIHealth')(),
  ])

  const result = _.extend(initial, ...checks)

  if (result.healthy) {
    return ctx.send(result)
  }

  ctx.response.status = 424
  ctx.response.body = result
}
