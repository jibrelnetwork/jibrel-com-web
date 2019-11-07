'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/configurations/configurations.html#bootstrap
 */

const PUBLIC_ROLE_ID = 2

module.exports = async () => {
  // Enable public access to some controllers on init
  await strapi.plugins['users-permissions'].services.userspermissions
    .updateRole(PUBLIC_ROLE_ID, {
      permissions: {
        application: {
          controllers: {
            pages: {
              list: {
                enabled: 1,
              },
              offering: {
                enabled: 1,
              },
              about: {
                enabled: 1,
              },
              invest: {
                enabled: 1,
              },
            },
          },
        },
      },
    })
}
