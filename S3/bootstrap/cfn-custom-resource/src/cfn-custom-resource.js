const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'us-east-1'});
const ddb = new AWS.DynamoDB({region: 'us-east-1', apiVersion: '2012-10-08'});
const cfn = require('cfn-response');

const promise = (func) => new Promise((resolve, reject) => {
    func((err, data) => {
        if (err) reject(err);
        else resolve(data);
    });
});

const ddbPutItem    = (params) => promise(x => ddb.putItem(params, x));
const s3CopyObject   = (params) => promise(x => s3.copyObject(params, x));
const s3CreateBucket    = (params) => promise(x => s3.createBucket(params, x));
const s3DeleteBucket    = (params) => promise(x => s3.deleteBucket(params, x));
const s3DeleteObject   = (params) => promise(x => s3.deleteObject(params, x));
const s3GetBucketPolicy = (params) => promise(x => s3.getBucketPolicy(params, x));
const s3GetObject   = (params) => promise(x => s3.getObject(params, x));
const s3ListObjects = (params) => promise(x => s3.listObjects(params, x));
const s3PutBucketPolicy = (params) => promise(x => s3.putBucketPolicy(params, x));
const s3PutObject   = (params) => promise(x => s3.putObject(params, x));

exports.handler = (event, context) => {
    console.log('event: ' + JSON.stringify(event, null, 2));
    console.log('context: ' + JSON.stringify(context, null, 2));

    if (event.RequestType == 'Create') {
        return create_resources(event, context);
    }

    if (event.RequestType == 'Update') {
        return update_resources(event, context);
    }

    if (event.RequestType == 'Delete') {
        return delete_resources(event, context);
    }
};

update_resources = (event, context) => {
    return cfn.send(event, context, cfn.SUCCESS);
};

delete_resources = (event, context) => {

    const ddbTableName = event.ResourceProperties.DdbTableName;
    const srcBucket = event.ResourceProperties.SrcS3Bucket;
    const dstBucket = event.ResourceProperties.DstS3Bucket;
    const cardsBucketEU = `${dstBucket}-eu-central-1`;

    const cleanupS3EU =
        s3ListObjects({
            Bucket: srcBucket, Prefix: 'card-eu-central-1'
        }).then(list => Promise.all(list.Contents.map(item => {
            const destKey = item.Key.replace('card-eu-central-1', 'card');
            console.log(`Deleting ${cardsBucketEU}/${destKey}`);
            return s3DeleteObject({
                Key: destKey,
                Bucket: cardsBucketEU
            });
        }))).then(data => {
            console.log(`Deleting Bucket: ${cardsBucketEU}`);
            return s3DeleteBucket({Bucket: cardsBucketEU});
        }).catch(error => {
            if(error.code === 'NoSuchBucket') {
                console.log('Error while deleting bucket. Bucket already deleted.');
            } else {
                throw error;
            }
        });

    Promise.all([ cleanupS3EU ])
    .then(data => {
        console.log('Resource cleanup done!');
        cfn.send(event, context, cfn.SUCCESS);
    })
    .catch(err => {
        console.log('error: ' + JSON.stringify(err, null, 2));
        cfn.send(event, context, cfn.FAILED, err);
    });

    return cfn.send(event, context, cfn.SUCCESS);
};

create_resources = (event, context) => {
    const ddbTableName = event.ResourceProperties.DdbTableName;
    const srcBucket = event.ResourceProperties.SrcS3Bucket;
    const dstBucket = event.ResourceProperties.DstS3Bucket;
    const cardsBucketEU = `${dstBucket}-eu-central-1`;

    const bootstrapS3EU =
        s3CreateBucket({
            Bucket: cardsBucketEU,
            CreateBucketConfiguration: { LocationConstraint: 'eu-central-1' },
            ACL: 'public-read'
        }).catch(error => {
            console.log('Error while creating bucket.');
            if(error.code !== 'BucketAlreadyOwnedByYou') {
                throw error;
            }
        }).then(data => {
            console.log(`Created bucket ${cardsBucketEU}`);
            return s3GetBucketPolicy({
                Bucket: dstBucket
            });
        }).catch(error => {
            console.log(`Error while getting policy for ${dstBucket}.`);
            throw error;
        }).then(data => {
            console.log(`Got bucket policy for ${dstBucket} : ` + data.Policy);
            return s3PutBucketPolicy({
                Bucket: cardsBucketEU,
                Policy: data.Policy.replace(dstBucket, cardsBucketEU)
            });
        }).catch(error => {
            console.log(`Error while updating policy for ${cardsBucketEU}.`);
            throw error;
        }).then(data => {
            return s3ListObjects({ Bucket: srcBucket, Prefix: 'card-eu-central-1'} )
        }).catch(error => {
            console.log('Error while listing bucket objects.');
            throw error;
        }).then(list => Promise.all(list.Contents.map(item => {
            console.log(`Copying ${srcBucket}/${item.Key} to ${cardsBucketEU}`);
            return s3CopyObject({
                CopySource: srcBucket + '/' + item.Key,
                Key: item.Key.replace('card-eu-central-1', 'card'),
                Bucket: cardsBucketEU
            });
        })));

    const bootstrapS3 =
        s3ListObjects({ Bucket: srcBucket })
        .then(list => Promise.all(list.Contents.map(item => {
            return s3GetObject({
                Bucket: srcBucket, Key: item.Key
            }).then(data => s3PutObject({
                Bucket: dstBucket, Key: item.Key,
                Body: data.Body, ContentType: data.ContentType
            }));
        })));

    const bootstrapDDB =
        s3GetObject({ Bucket: srcBucket, Key: 'bootstrap/cards.json' })
        .then(data => Promise.all(JSON.parse(data.Body)
            .map(card => ddbPutItem({
                TableName: ddbTableName,
                Item: {
                    CardId: { 'S': card.CardId },
                    Description: { 'S': card.Description },
                    Likes: { 'N': '0' }
                }
            }))
        ));


    Promise.all([ bootstrapS3EU, bootstrapS3, bootstrapDDB ])
    .then(data => {
        console.log('Resource creation done!');
        cfn.send(event, context, cfn.SUCCESS);
    })
    .catch(err => {
        console.log('error: ' + JSON.stringify(err, null, 2));
        cfn.send(event, context, cfn.FAILED, err);
    });
};