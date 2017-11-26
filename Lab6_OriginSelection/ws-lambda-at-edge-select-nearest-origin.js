'use strict';
const querystring = require('querystring');

const regionToBucketMapping  =  {
    'us-east-1' : 'ws-lambda-at-edge-ad6f8d30',
    'eu-central-1' : 'ws-lambda-at-edge-ad6f8d30-eu-central-1'
};

exports.handler = (event, context, callback) => {
    console.log(event);
    const request = event.Records[0].cf.request;

    /**
     * Based on the value of the CloudFront-Viewer-Country header, you can change the origin
     * domain name so content is served from an origin nearer to viewer's country.
     *
     * NOTE: 1. To enable this functionality, you must configure your distribution to cache based on the
     *          CloudFront-Viewer-Country header. For more information, see
     *          http://docs.aws.amazon.com/console/cloudfront/cache-on-selected-headers
     *       2. CloudFront adds the CloudFront-Viewer-Country header after the viewer
     *          request event. To use this example, you must create a trigger for the
     *          origin request event.
     *       3. For demo, we'll also add an option to specify querystring to select country header. To 
     *          get querystring in origin-request event, you must configure your distribution to cache 
     *          based on querystring and send it to origin. For more information, see
     *          http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html
     */
    const params = querystring.parse(request.querystring);
    var countryCode = null;
    var region = 'us-east-1';

    if (params.country) {
        countryCode = params.country
    } else if (request.headers['cloudfront-viewer-country']) {
        countryCode = request.headers['cloudfront-viewer-country'][0].value;
    } else {
        console.log('No country override.');
    }

    if (countryCode === 'UK' || countryCode === 'DE' || countryCode === 'IE' ) {
        region = 'eu-central-1';
    }

    const bucketName = regionToBucketMapping[region];
    const domainName = `${bucketName}.s3.amazonaws.com`;
    /* Set s3 origin fields */
    request.origin = {
        s3: {
            domainName: domainName,
            region: region,
            authMethod: 'none',
            path: '',
            customHeaders: {}
        }
    };
    request.headers['host'] = [{ key: 'host', value: domainName }];


    callback(null, request);
};