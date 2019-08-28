require('dotenv').config();
const AWS = require('aws-sdk');
const signale = require('signale');
const fs = require('fs');
const path = require('path');
const util = require('util');
const locations = require('../config/locations');

/* Set the Region */
AWS.config.update({ region: 'ap-south-1' });

/* Create S3 service object */
const s3 = new AWS.S3({
   apiVersion: '2006-03-01',
   accessKeyId: process.env.ACCESS_KEY_ID,
   secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3Upload = util.promisify(s3.upload.bind(s3));

async function uploadToS3({ file }) {
   const filename = path.basename(file);
   const location = locations[filename];
   if (location && filename === path.basename(location)) {
      const uploadParams = {
         Key: location,
         Body: fs.createReadStream(file),
         Bucket: process.env.BUCKET_NAME,
         ContentDisposition: 'attachment',
         ACL: 'public-read',
      };

      return s3Upload(uploadParams);
   }
   return false;
}

(async () => {
   let counter = 0;
   const files = fs.readdirSync(path.resolve('uploads'));
   signale.info(`Total files uploading ${files.length}`);

   // eslint-disable-next-line
   for (const file of files) {
      try {
         // eslint-disable-next-line
         const fileUploaded = await uploadToS3({ file: path.resolve(`uploads/${file}`) });
         if (fileUploaded) {
            signale.success(
               `${fileUploaded.Key} upload completed - ${fileUploaded.Bucket} ${fileUploaded.Key}`
            );
            counter += 1;
         } else {
            signale.warn('location mapping is missing - ', file);
         }
      } catch (error) {
         signale.error('Uploading failed for', file);
         signale.fatal(error);
      }
   }

   signale.info(`Total files uploaded ${counter}/${files.length}`);
})();
