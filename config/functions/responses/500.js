'use strict'

const _ = require('lodash')

module.exports = async (ctx) => {
  if (ctx.accepts('html')) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('500 Internal Server Error'))

    return ctx.render('500.hbs')
  }

  return ctx.notFound()
}
