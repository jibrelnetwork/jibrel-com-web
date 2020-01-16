const path = require('path')
const { promisify } = require('util')
const sass = require('node-sass')
const sassRender = promisify(sass.render)
const postcss = require('postcss')([
  require('autoprefixer'),
])
const tildeImporter = require('node-sass-tilde-importer')

module.exports = async function (filename, dest, src) {
  const unprefixedFilename = path.basename(filename, '.scss')
  const outFile = path.resolve(dest, `${unprefixedFilename}.css`)
  const srcFile = path.resolve(src, `${unprefixedFilename}.scss`)

  const sassRenderResult = await sassRender({
    file: filename,
    outFile,
    sourceMap: true,
    importer: tildeImporter,
  })

  const postcssProcessResult = await postcss.process(sassRenderResult.css, {
    from: srcFile,
    to: outFile,
    map: {
      inline: false,
      prev: sassRenderResult.map.toString(),
    },
  })

  postcssProcessResult.names = {
    css: `${unprefixedFilename}.css`,
    map: `${unprefixedFilename}.css.map`,
  }

  return postcssProcessResult
}
