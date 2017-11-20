## Lab 1 - Security

Security always comes first.

Let's check and improve our website safety by adding a number of security headers to enforce HTTPS and prevent XSS.

### 1. Scan the website for security vulnerabilities

Go to https://observatory.mozilla.org/ and scan the CloudFront distribution domain name created for you by the CloudFormation stack, `d123.cloudfront.net`.

The result of the scan will be unsatisfactory:

![x](./img/security-bad.png)

### 2. Create a Lambda function

Create a Lambda function in `us-east-1` region that would add the security headers to all responses from the origin in the CloudFront distribution.

Choose `Node.js 6.10` runtime and IAM role named `ws-lambda-edge-basic-<UNIQUE_ID>`, which was created by CloudFormation stack in your account, as an execution role of the function. This will allow pushing logs from your function to CloudWatch Logs.

Use JavaScript code from [ws-lambda-at-edge-add-security-headers.js](./ws-lambda-at-edge-add-security-headers.js) as a blueprint.

![x](./img/create-function.png)

### 3. Validate the function works with test-invoke in Lambda Console

When the function is created and is ready to be associated with a CloudFront distribution, it's highly recommended to first test it to make sure it executes successfully and produces the expected outcome. This can be done using a test invoke in Lambda Console. Save the function and click `Test`.

You will be prompted with a window that allows you to create a test event - an input for your function. Use the event template called "CloudFront Modify Response Header".

![x](./img/configure-test-event.png)

Now the function can be tested with the configured test event.  
Validate that the security headers are now seen in the the execution result of the test invocation.

![x](./img/test-invoke-succeeded.png)

### 4. Publish the function version

Before a Lambda function can be associated with and triggered by a CloudFront distribution, you need to "publish" it to get a function version ARN. This "freezes" the function code and configuration so that you can further modify the function while CloudFront still uses the immutable function version.

Choose "Publish new version" under "Actions", specify an optional description of a function version and click "Publish".

Now you have a published function version ARN.

![x](./img/publish.png)

### 5. Add a trigger

The next step is to configure a CloudFront distribution to trigger the Lambda function execution on one of the four event types. This can be done in both Lambda or CloudFront Console.

While we are at the Lambda Console, choose "Add trigger" under "Triggers", you will be presented with an "Add trigger" dialog:
* In the "Distribution ID" field, find the CloudFront distribution created for this workshop.  
* Choose the default cache behavior, that is currently the only behavior in the distribution that matches all URI paths with the `*` wildcard.  
* Choose "Origin Response" event type to trigger the function. We want to add the security headers every time we receive a response from the origin so that the modified response would be cached together with the added security headers in the CloudFront cache.
* Confirm a global replication of the function by choosing "Enable trigger and replicate"

![x](./img/add-trigger2.png)

After the trigger has been created, you will see it in the list of triggers of the function version.

![x](./img/add-trigger3.png)

### 6. Configure HTTP to HTTPs redirect.

Besides adding the security headers to all HTTP responses, it is also recommended to redirect HTTP traffic to the HTTPS URLs with the same URI location. This can be easily enabled in the CloudFront Console.

Open CloudFront Console and find the distribution created for this workshop. Navigate to the "Behaviors" tab and open the default cache behavior:
* Set "Viewer Protocol Policy" to "Redirect HTTP to HTTPs"
* You can also see the Lambda function ARN here configured for "Origin Response" event type in the previous step. No action needed. This is just another way to configure the trigger association in CloudFront Console.

![x](./img/cb-redirect-associated.png)

### 7. Wait for the change to propagate

After any modification of a CloudFront distribution, the change should be propagated globally to all CloudFront edge locations. The propagation status is indicated as "In Progress" and "Deployed" when it's complete. Usually ~30-60seconds is enough for the change to take effect, even though the status may be still "In Progress". To be 100% certain though you can wait until the change is fully deployed.

### 8. Invalidate CloudFront cache

In order to purge any objects that may have been cached without the security headers, submit a wildcard invalidation '/*'.

![x](./img/invalidate.png)

### 9. Validate the security headers are now seen in the HTTP responses

You can validate that the security headers are now being added to all responses to your CloudFront distribution. You can use browser developer tools or a command line.

```
curl --head https://d123.cloudfront.net
```

### 10. ReScan the website for security

Re-scan the distribution domain name with https://observatory.mozilla.org/ similar to step 1.

Now you have 100/100 score! :)

![x](./img/security-good.png)

![x](./img/security-good2.png)
