var AWS = require('aws-sdk');
var glob = require('glob');
var fs = require('fs');

var DistributionId = process.env.WERCKER_DEPLOYTARGET_NAME === 'Beta' ?
  process.env.DISTID_BETA : process.env.DISTID_PROD;

AWS.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION
});

var batch = [];
var CallerReference = '' + new Date().getTime();

glob('app/dist/**', {}, function(error, files){
  files.forEach(function(f){
    if(fs.lstatSync(f).isFile() && /\.(css|js)$/.test(f)){
      batch.push(f.replace('app/dist', ''));
    }
  });
  console.log(batch);
  var cloudfront = new AWS.CloudFront();
  cloudfront.createInvalidation({
    DistributionId: DistributionId,
    InvalidationBatch: {
      CallerReference: CallerReference,
      Paths: {
        Quantity: batch.length,
        Items: batch
      }
    }
  }, function(err, data) {
    if (err) {
      console.error(err);
    }
    console.log(data);
  });
})