const intToHexWithLeadingZero = (n) => {
  const s = '0' + n.toString(16)
  return s.substr(s.length - 2)
}

const rgbaToHex = ([rSource, gSource, bSource, a]) => {
  const r = Math.ceil(rSource * a + 255 * (1 - a))
  const g = Math.ceil(gSource * a + 255 * (1 - a))
  const b = Math.ceil(bSource * a + 255 * (1 - a))

  return `#${intToHexWithLeadingZero(r)}${intToHexWithLeadingZero(g)}${intToHexWithLeadingZero(b)}`
}

module.exports = {
  rgbaToHex,
}
