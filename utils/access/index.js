const ACCESS_LEVEL = {
  PUBLIC: 'public',
  REGISTERED: 'registered',
  VERIFIED: 'verified',
  MODERATOR: 'moderator',
  PRIVATE: 'private',
}

const ACCESS_WEIGHT = {
  [ACCESS_LEVEL.PUBLIC]: 0,
  [ACCESS_LEVEL.REGISTERED]: 10,
  [ACCESS_LEVEL.VERIFIED]: 20,
  [ACCESS_LEVEL.MODERATOR]: 90,
  [ACCESS_LEVEL.PRIVATE]: 100,
}

module.exports = {
  ACCESS_LEVEL,
  isAccessible: (itemLevel, visitorLevel) =>
    ACCESS_WEIGHT[itemLevel] <= ACCESS_WEIGHT[visitorLevel],
}
