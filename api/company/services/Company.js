'use strict'

const { sanitizeEntity } = require('strapi-utils')
const _ = require('lodash')

module.exports = {
  prepare (data) {
    const company = sanitizeEntity(
      data,
      { model: strapi.models.company }
    )

    company.tags = company.tags
      ? company.tags
        .map(strapi.services.tag.prepare)
      : []

    company.translations_index = company.translations
      ? company.translations
        .reduce((memo, t) => {
          const translation = strapi.services.companytranslation.prepare(t)

          memo[translation.lang] = translation

          return memo
        }, {})
      : {}
    company.translations_index.en = {
      ...company,
      lang: 'en',
    }

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
    _.extend(
      company,
      company.translations_index[locale]
        || company.translations_index[lang],
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
      'tags',
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
      'tags',
      'translations',
      'offerings',
    ])

    if (!rawCompany) {
      return undefined
    }

    return rawCompany
  }
}
