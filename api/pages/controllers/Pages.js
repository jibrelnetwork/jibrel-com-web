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
    const { company } = strapi.services

    const companies = (await company.list())
      .map(c =>
        company.localize(
          ctx.i18n,
          company.prepare(c),
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
      company.prepare(rawData, {
        access: ctx.state.visitor.access,
      }),
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

  async logout(ctx) {
    ctx.cookies.set('sessionid', null, {
      domain: `.${process.env.FRONTEND_ROOT_DOMAIN_NAME}`
    })
    const lang = ctx.cookies.get('lang') || ctx.i18n.defaultLocale

    return ctx.redirect(`/${lang}`)
  },

  async noop(ctx) {
    return ctx.send('')
  },
}
