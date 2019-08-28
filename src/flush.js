require('dotenv').config();
const AWS = require('aws-sdk');
const signale = require('signale');
const uid = require('uid');

const cloudFront = new AWS.CloudFront({
   apiVersion: '2019-03-26',
   accessKeyId: process.env.ACCESS_KEY_ID,
   secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const params = {
   DistributionId: process.env.DISTRIBUTION_ID,
   InvalidationBatch: {
      CallerReference: uid(),
      Paths: {
         Quantity: 1,
         Items: [
            '/downloads/fusionexport/latest/*',
            /* more items */
         ],
      },
   },
};

cloudFront.createInvalidation(params, (err, data) => {
   if (err) signale.fatal(err, err.stack);
   else signale.success(data);
});
