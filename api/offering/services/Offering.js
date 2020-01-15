'use strict'

const { isPast, isFuture, parseISO } = require('date-fns')
const _ = require('lodash')
const rp = require('request-promise')

const log = strapi.log.child({ module: 'offering/services' })

module.exports = {
  prepare (data) {
    if (!data) {
      return data
    }

    const offering = { ...data }

    const date_start = offering.date_start
      ? parseISO(offering.date_start)
      : null

    const date_end = offering.date_end
      ? parseISO(offering.date_end)
      : null

    // FIXME: should check relative to fixed time zone
    offering.is_active = date_start
      && isPast(date_start)
      && (!date_end || isFuture(date_end))
    offering.is_past = date_end
      ? isPast(date_end)
      : false
    offering.is_future = isFuture(date_start)

    if (offering.raise === undefined) {
      offering.raise = 0
    }

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

    const moneyLocale = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: i18n.user.currency,
      minimumFractionDigits: 0,
    })

    const date_end = offering.date_end
      ? parseISO(offering.date_end)
      : null

    offering.date_end_left_formatted = date_end
      ? i18n.date.formatDistanceToNow(date_end, {
        addSuffix: isPast(date_end)
      })
      : null
    offering.date_end_formatted = date_end
      ? i18n.date.format(date_end, 'PPP')
      : null

    offering.progress = _.floor(100 * offering.raise / offering.goal, 2)
    offering.goal_formatted = moneyLocale.format(offering.goal)
    offering.raise_formatted = moneyLocale.format(offering.raise)
    offering.min_investment_formatted = moneyLocale.format(offering.limit_min_amount)
    offering.max_investment_formatted = moneyLocale.format(offering.limit_max_amount)
    offering.valuation_formatted = moneyLocale.format(offering.valuation)
    offering.equity_formatted = `${offering.equity}%`

    if (offering.security) {
      offering.type_formatted = i18n.__(`offering.type.${offering.security.type}`)
    }
    offering.round_formatted = i18n.__(`offering.round.${offering.round}`)

    return offering
  },

  async list (slug) {
    const start = +new Date()

    try {
      log.trace({
        msg: 'Request offerings API',
        baseUrl: _.get(strapi.config, 'api.baseUrl'),
        url: `/cms/company/${slug}/offerings`,
      })
      const data = await rp({
        baseUrl: _.get(strapi.config, 'api.baseUrl'),
        url: `/cms/company/${slug}/offerings`,
        headers: {
          'User-Agent': _.get(strapi.config, 'api.userAgent'),
          'Authorization': `Bearer ${_.get(strapi.config, 'api.authToken')}`,
        },
        json: true,
      })
      log.debug(`Response from offerings API (${(new Date()) - start} ms)`)
      log.trace({
        msg: 'Response from offering API data',
        data,
      })

      return data
    } catch (error) {
      log.error({
        msg: `Failed request offerings API (${(new Date()) - start} ms)`,
        baseUrl: _.get(strapi.config, 'api.baseUrl'),
        url: `/cms/company/${slug}/offerings`,
        error,
      })

      return []
    }
  },
}
