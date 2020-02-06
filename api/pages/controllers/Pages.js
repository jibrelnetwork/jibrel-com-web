'use strict';

const _ = require('lodash')

module.exports = {
  async about(ctx) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('About'))
    _.set(ctx, 'state.page.id', 'about')

    await ctx.render('about.hbs')
  },

  async invest(ctx) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('Invest'))
    _.set(ctx, 'state.page.id', 'invest')

    await ctx.render('invest.hbs')
  },

  async raise(ctx) {
    _.set(ctx, 'state.page.title', ctx.app.createPageTitle('Raise'))
    _.set(ctx, 'state.page.id', 'raise')

    await ctx.render('raise.hbs')
  },

  async static(ctx) {
    // FIXME: check markdown source and template existence, then render it or proceed to 404
    return ctx.notFound()
  },

  async main(ctx) {
    const {
      company,
      offering,
    } = strapi.services

    const rawCompanies = await company.list()

    const companies = (await Promise.all(
      rawCompanies.map((c) =>
        offering.list(c.slug)
          .then((offerings) => {
            c.offerings = offerings
            return c
          })
      )
    ))
      .map(c =>
        company.localize(
          ctx.i18n,
          company.prepare(c),
        )
      )

    await ctx.render('main.hbs', {
      companies,
    })
  },

  async company(ctx) {
    const {
      company,
      offering,
    } = strapi.services

    const [rawData, rawOfferingsData] = await Promise
      .all([
        company.slug(ctx.params.slug),
        offering.list(ctx.params.slug),
      ])

    if (!rawData) {
      return ctx.notFound()
    }

    rawData.offerings = rawOfferingsData

    const data = company.localize(
      ctx.i18n,
      company.prepare(rawData, {
        access: ctx.state.visitor.access,
      }),
    )

    _.set(ctx, 'state.page.title', ctx.app.createPageTitle(data.title))
    _.set(ctx, 'state.page.description', data.pitch)

    await ctx.render('company.hbs', data)
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

  async notFound(ctx) {
    return ctx.notFound()
  },

  async internalError() {
    throw new Error('500')
  },
}
