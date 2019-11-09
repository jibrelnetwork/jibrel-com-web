'use strict';

const _ = require('lodash')
const { sanitizeEntity } = require('strapi-utils')
const format = require('date-fns/format')
const formatDistanceToNow = require('date-fns/formatDistanceToNow')
const isFuture = require('date-fns/isFuture')
const isPast = require('date-fns/isPast')
const { en, ar, ko } = require('date-fns/locale')
const adjustHeadingLevels = require('../../../utils/markdown-it-plugin-adjust-heading-levels')
const md = require('markdown-it')({
  html: true,
  breaks: true,
  typographer: true
}).use(adjustHeadingLevels, { minLevel: 3 })

const dateLocales = {
  en,
  ar,
  ko,
}

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */

const createTitle = (title) => title
  ? `${title} • Jibrel.com`
  : 'Jibrel.com'

function getPageData(ctx, config = {}) {
  const lang = ctx.getLocaleFromUrl()
  const dir = lang === 'ar'
    ? 'rtl'
    : 'ltr'

  return {
    page: {
      lang,
      dir,
      title: createTitle(config.title),
      description: config.description || 'Jibrel enables startups and investors to connect in previously unimaginable ways to create capital formation.',
    }
  }
}

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
  o.investment_active = o.investment_deadline
    ? isFuture(o.investment_deadline)
    : true
  o.investment_deadline_left_formatted = o.investment_deadline
    ? formatDistanceToNow(o.investment_deadline, {
      locale: dateLocale,
      addSuffix: isPast(o.investment_deadline)
    })
    : null
  o.investment_deadline_formatted = o.investment_deadline
    ? format(o.investment_deadline, 'PPP', {
      locale: dateLocale,
    })
    : null
  o.investment_progress = _.floor(100 * o.investment_commited_usd / o.investment_goal_usd, 2)
  o.investment_goal_formatted = moneyLocale.format(o.investment_goal_usd)
  o.investment_commited_formatted = moneyLocale.format(o.investment_commited_usd)
  o.deal_valuation_formatted = moneyLocale.format(o.deal_valuation_usd)
  o.deal_valuation_cap_formatted = moneyLocale.format(o.deal_valuation_cap_usd)
  o.deal_min_investment_formatted = moneyLocale.format(o.deal_min_investment_usd)
  o.deal_equity_formatted = `${o.deal_equity_percent}%`
  o.website_name = o.website_url
    ? (new URL(o.website_url)).hostname
    : null
  o.tags = o.tags_csv
    ? o.tags_csv.split(',').map(t => t.trim())
    : []

  return o
}

module.exports = {
  async list(ctx) {
    const { lang } = getPageData(ctx).page

    const rawOfferings = await strapi.query('primaryoffering').find({
      active: true,
      lang,
    })

    const offerings = rawOfferings
      .map(transformOffering)

    await ctx.render('index.hbs', {
      offerings,
      ...getPageData(ctx, {
        title: 'Startup investing made simple, for everyone',
      }),
    })
  },

  async about(ctx) {
    await ctx.render('about.hbs', {
      ...getPageData(ctx, {
        title: 'About',
      }),
    })
  },

  async offering(ctx) {
    const { lang } = getPageData(ctx).page

    const rawOffering = await strapi.query('primaryoffering').findOne({
      active: true,
      lang,
      slug: ctx.params.slug,
    })

    const offering = transformOffering(rawOffering)

    await ctx.render('primary-offering.hbs', {
      ...offering,
      description_html: md.render(offering.description || ''),
      ...getPageData(ctx, {
        title: offering.title,
        description: offering.pitch,
      }),
    })
  },

  async invest(ctx) {
    const { lang } = getPageData(ctx).page

    const rawOffering = await strapi.query('primaryoffering').findOne({
      active: true,
      lang,
      slug: ctx.params.slug,
    })

    const offering = transformOffering(rawOffering)

    await ctx.render('invest.hbs', {
      ...offering,
      ...getPageData(ctx, {
        title: `Invest in ${offering.title}`,
        description: offering.pitch,
      }),
    })
  },

  async redirectToLang(ctx) {
    ctx.redirect('/en')
  }
}
