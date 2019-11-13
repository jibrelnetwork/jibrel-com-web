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
              redirectToLang: {
                enabled: 1,
              },
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
            system: {
              version: {
                enabled: 1,
              },
            },
          },
        },
      },
    })

  // if there is S3 config for current environment, start with it
  if (strapi.config.currentEnvironment['aws-s3']) {
    const s3Config = strapi.config.currentEnvironment['aws-s3']

    await strapi
      .store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'upload',
      })
      .set({
        key: 'provider',
        value: {
          enabled: true,
          provider: 'aws-s3',
          region: s3Config.region,
          public: s3Config.public,
          private: s3Config.private,
          bucket: s3Config.bucket,
          root: s3Config.root || strapi.config.environment,
        }
      })
  }
}
