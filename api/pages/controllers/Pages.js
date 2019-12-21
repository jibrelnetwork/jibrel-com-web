'use strict';

const _ = require('lodash')

module.exports = {
  async about(ctx) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('About'))

    await ctx.render('about.hbs')
  },

  async invest(ctx) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('Invest'))

    await ctx.render('invest.hbs')
  },

  async raise(ctx) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('Raise'))

    await ctx.render('raise.hbs')
  },

  async list(ctx) {
    const companies = (await strapi.services.company.list())
      .map(company =>
        strapi.services.company.localize(
          ctx.i18n,
          strapi.services.company.prepare(company),
        )
      )

    await ctx.render('index.hbs', {
      companies,
    })
  },

  async company(ctx) {
    const { company } = strapi.services

    const rawData = await company.slug(ctx.params.slug)

    if (!rawData) {
      return ctx.notFound()
    }

    const data = company.localize(
      ctx.i18n,
      company.prepare(rawData),
    )

    _.set(ctx, 'state.page.title', ctx.app.createPageTitle(data.title))
    _.set(ctx, 'state.page.description', data.tagline)

    await ctx.render('company.hbs', data)
  },

  async offering(ctx) {
    const offering = await strapi.services.offering.localizedWithCompany(
      ctx.i18n,
      ctx.params.slug,
      ctx.params.id,
    )

    _.set(ctx, 'state.page.title', ctx.app.createPageTitle(`${offering.company.title} ${offering.round_formatted} investment`))
    _.set(ctx, 'state.page.description', offering.company.pitch)

    await ctx.render('offering.hbs', offering)
  },

  async noop(ctx) {
    return ctx.send('')
  }
}
