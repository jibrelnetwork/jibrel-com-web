'use strict';

const { promisify } = require('util')
const path = require('path')
const fs = require('fs')

const readFile = promisify(fs.readFile)

module.exports = {
  async version(ctx) {
    const version = await readFile(path.resolve(
      __dirname,
      '../../../version.txt',
    ), 'utf8')

    return ctx.send(version.trim())
  },
}
