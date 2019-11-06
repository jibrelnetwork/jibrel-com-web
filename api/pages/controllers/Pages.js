'use strict';

const _ = require('lodash')
const { sanitizeEntity } = require('strapi-utils')
const format = require('date-fns/format')
const formatDistanceToNow = require('date-fns/formatDistanceToNow')
const isFuture = require('date-fns/isFuture')
const { en, ar, ko } = require('date-fns/locale')

const dateLocales = {
  en,
  ar,
  ko,
}

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

function transformOffering(offering) {
  const o = sanitizeEntity(
    offering,
    { model: strapi.models.primaryoffering }
  )

  const dateLocale = _.get(dateLocales, o.lang, dateLocales.en)
  const moneyLocale = new Intl.NumberFormat(o.lang, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })

  o.preview_bg_img = _.get(o, 'preview_bg_img.url', '#')
  o.logo_img = _.get(o, 'logo_img.url', '#')
  o.url = `/${o.path}`
  o.hero_img = _.get(o, 'hero_img.url', '#')
  o.investment_active = isFuture(o.investment_deadline)
  o.investment_deadline_left_formatted = formatDistanceToNow(o.investment_deadline, {
    locale: dateLocale,
  })
  o.investment_deadline_formatted = format(o.investment_deadline, 'PPP', {
    locale: dateLocale,
  })
  o.investment_progress = _.floor(100 * o.investment_commited_usd / o.investment_goal_usd, 2)
  o.investment_goal_formatted = moneyLocale.format(o.investment_goal_usd)
  o.investment_commited_formatted = moneyLocale.format(o.investment_commited_usd)
  o.deal_valuation_formatted = moneyLocale.format(o.deal_valuation_usd)
  o.deal_min_investment_formatted = moneyLocale.format(o.deal_min_investment_usd)
  o.deal_equity_formatted = `${o.deal_equity_percent}%`
  o.website_name = o.website_url
    ? (new URL(o.website_url)).hostname
    : null

  return o
}

module.exports = {
  async list(ctx) {
    const lang = ctx.getLocaleFromUrl()
    const dir = lang === 'ar'
      ? 'rtl'
      : 'ltr'

    const rawOfferings = await strapi.query('primaryoffering').find({
      active: true,
      lang,
    })

    const offerings = rawOfferings
      .map(transformOffering)

    await ctx.render('index.hbs', {
      lang,
      dir,
      offerings,
    })
  },

  async offering(ctx) {
    const lang = ctx.getLocaleFromUrl()
    const dir = lang === 'ar'
      ? 'rtl'
      : 'ltr'

    const rawOffering = await strapi.query('primaryoffering').findOne({
      active: true,
      lang,
      slug: ctx.params.slug,
    })

    await ctx.render('primary-offering.hbs', {
      ...transformOffering(rawOffering),
      lang,
      dir,
    })
  },
}
