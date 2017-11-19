## Lab 1 - Security

Security always comes first. Let's improve our website safity
by adding a number of security headers to enforce HTTPS and prevent XSS.

### 1. Scan the website for security vulnerabilities

Go to https://observatory.mozilla.org/ and scan d123.cloudfront.net

### 2. Configure HTTP to HTTPs redirect

Go to CloudFront Console, in the default Cache Behavior configure:  
"Viewer Protocol Policy" = "Redirect HTTP to HTTPS"

### 3. Create a Lambda function

```
   Name:          ws-lambda-edge-add-security-headers
   Role:          Choose an existing role
   Existing role: ws-lambda-edge-basic-<UNIQUE_ID>
   Runtime:       Node.js 6.10

   Use the blueprint: ./ws-lambda-edge-add-security-headers.js
```

### 4. Validate the function works with test-invoke in Lambda Console

   Use event template "CloudFront Modify Response Header".
   Validate the security headers are now seen in the the execution result
   of the test invocation.

### 5. Publish the function version

   Save and publish the function to get a function version ARN.

### 6. Configure the Lambda@Edge trigger

   Associate the function with origin-response trigger of
   the CloudFront distribution.

   This can be done either in Lambda or CloudFront Console.

### 7. Wait for the change to propagate

   Usually ~30-60sec is enough. To be certain you can wait
   until the change is fully deployed as reported by the CloudFront Console.

### 8. Invalidate CloudFront cache

   In order to purge any objects cached without the security headers,
   submit wildcard invalidation '/*' using CloudFront Console.

### 9. Validate the security headers are now seen in the responses

   Use browser developer tools.
   Use command line: curl --head https://d123.cloudfront.net

### 10. ReScan the website for security

    Re-scan it with https://observatory.mozilla.org/
    Now you have 100/100 score! :)
