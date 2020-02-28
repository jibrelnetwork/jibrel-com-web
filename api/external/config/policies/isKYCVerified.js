module.exports = (ctx, next) => {
  if (!ctx.state.visitor.kyc.verified) {
    return ctx.forbidden()
  }

  return next()
}
