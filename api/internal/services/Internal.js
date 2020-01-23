'use strict'

const path = require('path')
const crypto = require('crypto')
const uuid = require('uuid/v4')
const request = require('request')

const log = strapi.log.child({ module: 'internal/services' })

function niceHash(buffer) {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\//g, '-')
    .replace(/\+/, '_');
}

module.exports = {
  async importFileFromURL(url) {
    const urlObject = new URL(url)
    const meta = {
      url,
      name: path.basename(urlObject.path),
      ext: path.extname(urlObject.path),
      hash: uuid().replace(/-/g, ''),
    }

    return this.importFileFromMeta(meta)
  },

  async importFileFromMeta(meta) {
    const uploadService = strapi.plugins.upload.services.upload

    // Retrieve provider configuration
    const uploadConfig = await strapi
      .store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'upload',
      })
      .get({ key: 'provider' })

    const buffer = await new Promise((resolve) => {
      const parts = []
      request
        .get(meta.url)
        .on('response', function(response) {
          meta.mime = response.headers['content-type']
          meta.size = (response.headers['content-length'] / 1000).toFixed(2)
          response.on('data', function(part) {
            parts.push(part)
          })
          response.on('end', function() {
            resolve(Buffer.concat(parts))
          })
        })
    })

    meta.sha256 = niceHash(buffer)

    // if file copies exist, remove them
    const duplicateFiles = await uploadService.fetchAll({
      hash: meta.hash,
    })
    log.debug({
      msg: `Found ${duplicateFiles.length} copies of "${meta.name}", removing...`,
    })
    await Promise.all(duplicateFiles.map((f) => uploadService.remove(f, uploadConfig)))

    // upload prepared buffer
    await uploadService.upload([{
      ...meta,
      buffer,
    }], uploadConfig)

    return (await uploadService.fetchAll({
      name: meta.name,
    }))[0]
  },
}
