const { formatDistanceToNow } = require('date-fns')

module.exports = function getUptime() {
  const { launchedAt } = strapi.config
  const raw = new Date() - launchedAt
  const formatted = formatDistanceToNow(launchedAt, {
    includeSeconds: true,
  })

  return {
    uptime: `${raw} ms (${formatted})`,
  }
}
