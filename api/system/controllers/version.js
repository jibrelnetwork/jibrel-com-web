module.exports = async function version(ctx) {
  const { version } = await require('./healthcheck/getVersion')()

  return ctx.send(version)
}
