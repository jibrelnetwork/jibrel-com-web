'use strict'

const { sanitizeEntity } = require('strapi-utils')
const _ = require('lodash')

const ACCESS_WEIGHT = {
  public: 0,
  registered: 10,
  verified: 20,
  private: 100,
}

module.exports = {
  prepare (data, {
    access = 'public',
  } = {}) {
    if (!data) {
      return data
    }

    const company = sanitizeEntity(
      data,
      { model: strapi.models.company }
    )

    company.translations = company.translations.map((t) =>
      ({
        ...t,
        content: t.content
          ? t.content.map((b) =>
            ({
              ...b,
              isVisible: ACCESS_WEIGHT[b.access] <= ACCESS_WEIGHT[access],
            })
          )
          : []
      })
    )

    company.translations_index = company.translations
      ? company.translations
        .reduce((memo, t) => {
          memo[t.lang] = t
          return memo
        }, {})
      : {}

    company.offerings = company.offerings
      ? company.offerings
        .map(strapi.services.offering.prepare)
        // sort descending by start date
        .sort((a, b) => b.start - a.start)
      : []
    company.current_offering = company.offerings
      .find((offering) =>
        offering.is_active || offering.is_past
      )

    company.website_name = company.website_url
      ? (new URL(company.website_url)).hostname
      : null

    company._prepared = true

    return company
  },

  localize (i18n, data) {
    if (!data) {
      return data
    }

    // data preparation is prerequisite for localization
    const company = data._prepared
      ? data
      : this.prepare(data)

    const { locale } = i18n
    const lang = locale.split('-')[0]

    const moneyLocale = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: i18n.user.currency,
      minimumFractionDigits: 0,
    })

    company.permalink = `/${locale}/companies/${company.slug}`
    // translate company to current locale or language, if available
    company.translation = _.extend({},
      // locale is preferred
      company.translations_index[locale]
        // next goes language derived from locale
        || company.translations_index[lang]
        // next goes english as default
        || company.translations_index.en
        // next goes top-most language from the list
        || (company.translations && company.translations[0]),
    )

    company.offerings = company.offerings.map((offering) =>
      strapi.services.offering.localize(i18n, offering)
    )
    company.current_offering = strapi.services.offering.localize(
      i18n,
      company.current_offering,
    )

    return company
  },

  async list ({
    status = 'public',
  } = {}) {
    return await strapi.query('company').find({
      status,
    }, [
      'preview_bg_img',
      'logo_img',
      'hero_img',
      'translations',
      'offerings',
    ])
  },

  async slug (slug, {
    status = 'public',
  } = {}) {
    const rawCompany = await strapi.query('company').findOne({
      status,
      slug,
    }, [
      'preview_bg_img',
      'logo_img',
      'hero_img',
      'offerings',
      'translations',
      'translations.tags',
      'translations.content',
    ])

    if (!rawCompany) {
      return undefined
    }

    return rawCompany
  }
}
