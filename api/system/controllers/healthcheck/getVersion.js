const { promisify } = require('util')
const path = require('path')
const fs = require('fs')

const readFile = promisify(fs.readFile)

module.exports = async function getVersion () {
  try {
    return {
      version: (await readFile(path.resolve(
        __dirname,
        '../../../../version.txt',
      ), 'utf8')).trim(),
    }
  } catch (error) {
    strapi.log.error(error)

    return {
      healthy: false,
      version: 'unavailable',
    }
  }
}
