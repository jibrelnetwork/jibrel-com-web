'use strict';

// FIXME: it's a quick hack to modify config before it gets read by other middlewares
// should use proper methods like finding some pre-middleware hook suited for config updating
// (strapi hooks run after middlewares, so it's not them)
module.exports = strapi => {
  return {
    /**
     * Initialize the hook
     */
    initialize() {
      // fill origins if they are not set
      const self = new URL(strapi.config.origin.self)
      const prefixes = ['id', 'investor', 'company']
      prefixes.forEach((prefix) => {
        if (strapi.config.origin[prefix] === '') {
          const prefixUrl = new URL('', self)
          prefixUrl.hostname = `${prefix}.${self.hostname}`
          strapi.config.origin[prefix] = prefixUrl.origin
        }
      })

      // fill domains if they are not set
      if (strapi.config.hostname.shared === '') {
        strapi.config.hostname.shared = `.${self.hostname}`
      }

      if (strapi.config.currentEnvironment.security.cors.enabled === true) {
        const { origin: initialOrigin } = strapi.config.middleware.settings.cors
        const initialOriginArray = Array.isArray(initialOrigin)
          ? initialOrigin
          : initialOrigin.split(/\s*,\s*/)

        const allowedOrigin = new Set([
          ...initialOriginArray,
          strapi.config.origin.self,
          strapi.config.origin.id,
          strapi.config.origin.investor,
          strapi.config.origin.company,
        ])

        allowedOrigin.delete('')

        strapi.config.middleware.settings.cors.origin = [...allowedOrigin]
      }
    },
  }
}
