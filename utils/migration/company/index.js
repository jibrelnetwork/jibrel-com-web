// read index as "function to migrate from previous version to this one"
const transform = [
  (strapi, data) => {
    return data.map((company) => ({
      ...company,
    }))
  },
]

const version = transform.length - 1

module.exports = {
  transform,
  version,
}
