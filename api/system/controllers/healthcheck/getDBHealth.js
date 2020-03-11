module.exports = async function getDBHealth() {
  try {
    await strapi.query('company').count()
    return {
      db: 'ok',
    }
  } catch (error) {
    strapi.log.error(error)

    return {
      healthy: false,
      db: 'unavailable',
    }
  }
}
