'use strict'

const { sanitizeEntity } = require('strapi-utils')
const { isPast, isFuture } = require('date-fns')
const _ = require('lodash')

module.exports = {
  prepare (data) {
    if (!data) {
      return data
    }

    const offering = sanitizeEntity(
      data,
      { model: strapi.models.offering }
    )

    // FIXME: should check relative to fixed time zone
    offering.is_active = isPast(offering.start)
      && (!offering.deadline || isFuture(offering.deadline))
    offering.is_past = offering.deadline
      ? isPast(offering.deadline)
      : false
    offering.is_future = isFuture(offering.start)

    offering._prepared = true

    return offering
  },

  localize (i18n, data) {
    if (!data) {
      return data
    }

    // data preparation is prerequisite for localization
    const offering = data._prepared
      ? data
      : this.prepare(data)

    const { locale } = i18n
    const lang = locale.split('-')[0]

    const moneyLocale = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: i18n.user.currency,
      minimumFractionDigits: 0,
    })

    if (offering.company && offering.company.slug) {
      offering.permalink = `${locale}/companies/${offering.company.slug}/offerings/${offering.id}`
    }

    offering.deadline_left_formatted = offering.deadline
      ? i18n.date.formatDistanceToNow(offering.deadline, {
        addSuffix: isPast(offering.deadline)
      })
      : null
    offering.deadline_formatted = offering.deadline
      ? i18n.date.format(offering.deadline, 'PPP')
      : null

    offering.progress = _.floor(100 * offering.raise / offering.goal, 2)
    offering.goal_formatted = moneyLocale.format(offering.goal)
    offering.raise_formatted = moneyLocale.format(offering.raise)
    offering.min_investment_formatted = moneyLocale.format(offering.min_investment)
    offering.max_investment_formatted = moneyLocale.format(offering.max_investment)
    offering.valuation_formatted = moneyLocale.format(offering.valuation)
    offering.equity_formatted = `${offering.equity}%`

    offering.type_formatted = i18n.__(`offering.type.${offering.type}`)
    offering.round_formatted = i18n.__(`offering.round.${offering.round}`)

    return offering
  },

  async rawWithCompany (slug, id) {
    const rawOffering = await strapi.query('offering').findOne({
      id,
    }, [
      'company',
    ])

    if (
      !rawOffering
      || !rawOffering.company
      || !rawOffering.company.slug
      || rawOffering.company.slug !== slug
    ) {
      return undefined
    }

    return rawOffering
  },

  async localizedWithCompany (i18n, slug, id) {
    const rawOffering = await this.rawWithCompany(slug, id)

    if (!rawOffering) {
      return undefined
    }

    const offering = this.localize(
      i18n,
      this.prepare(rawOffering)
    )

    const rawCompany = await strapi.services.company.slug(slug)

    offering.company = strapi.services.company.localize(
      i18n,
      strapi.services.company.prepare(rawCompany),
    )

    return offering
  }
}
