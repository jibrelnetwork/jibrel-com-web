function getHeadingLevel(tagName) {
  if (tagName[0].toLowerCase() === 'h') {
    tagName = tagName.slice(1);
  }

  return parseInt(tagName, 10);
}

module.exports = function adjustHeadingLevel(md, options) {
  var minLevel = options.minLevel

  if (typeof minLevel === 'string') {
    minLevel = getHeadingLevel(minLevel)
  }

  if (!minLevel || isNaN(minLevel)) {
    return
  }

  const levelOffset = minLevel - 1;
  if (levelOffset < 1 || levelOffset > 6) {
    return
  }

  md.core.ruler.push("adjust-heading-levels", function(state) {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "heading_close") {
        continue
      }

      const headingOpen = tokens[i - 2]
      const headingClose = tokens[i]

      // we could go deeper with <div role="heading" aria-level="7">
      // see http://w3c.github.io/aria/aria/aria.html#aria-level
      // but clamping to a depth of 6 should suffice for now
      const currentLevel = getHeadingLevel(headingOpen.tag)
      const tagName = 'h' + Math.min(currentLevel + levelOffset, 6)

      headingOpen.tag = tagName
      headingClose.tag = tagName
    }
  })
}
