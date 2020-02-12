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

const hexToRgb = (hex) => {
  return [
    hex.slice(1, 3),
    hex.slice(3, 5),
    hex.slice(5, 7),
  ].map((hex) => parseInt(hex, 16))
}

module.exports = {
  rgbaToHex,
  hexToRgb,
}
