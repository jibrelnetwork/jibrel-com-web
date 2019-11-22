'use strict'

const _ = require('lodash')

module.exports = async (ctx) => {
  if (ctx.accepts('html')) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('404 Not Found'))

    return ctx.render('404.hbs')
  }

  return ctx.notFound()
}
