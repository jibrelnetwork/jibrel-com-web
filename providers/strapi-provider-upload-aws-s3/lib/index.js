'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

const trimParam = str => (typeof str === 'string' ? str.trim() : undefined);

module.exports = {
  provider: 'aws-s3',
  name: 'Amazon Web Service S3',
  auth: {
    region: {
      label: 'Region',
      type: 'enum',
      values: [
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-west-2',
        'ca-central-1',
        'ap-south-1',
        'ap-northeast-1',
        'ap-northeast-2',
        'ap-northeast-3',
        'ap-southeast-1',
        'ap-southeast-2',
        'cn-north-1',
        'cn-northwest-1',
        'eu-central-1',
        'eu-north-1',
        'eu-west-1',
        'eu-west-2',
        'eu-west-3',
        'sa-east-1',
      ],
    },
    bucket: {
      label: 'Bucket',
      type: 'text',
    },
  },
  init: config => {
    // configure AWS S3 bucket connection
    AWS.config.update({
      credentials: new AWS.EC2MetadataCredentials(),
      region: config.region,
    });

    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {
        Bucket: trimParam(config.bucket),
      },
    });

    return {
      upload: file => {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          const envPathPrefix = config.root ? `${config.root}/` : ''
          S3.upload(
            {
              Key: `${envPathPrefix}${path}${file.hash}${file.ext}`,
              Body: Buffer.from(file.buffer, 'binary'),
              ContentType: file.mime,
              CacheControl: 'public, max-age=31536000, immutable',
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              file.url = data.Location;

              resolve();
            }
          );
        });
      },
      delete: file => {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          const envPathPrefix = config.root ? `${config.root}/` : ''
          S3.deleteObject(
            {
              Key: `${envPathPrefix}${path}${file.hash}${file.ext}`,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
}
