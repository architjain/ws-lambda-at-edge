## Lab 4: Pretty URLs

In this lab, we will use Lambda@Edge to introduce pretty semantic URLs to our web application. Pretty URLs are easy to read and remember. They also help with search engine optimization and allow your viewers to use the descriptive links in social media.

Currently, we display card details at the URL like this one:  
`(a)` https://d123.cloudfront.net/card/da8398f4  
an example of the corresponding semantic URL would be something like:  
`(b)` https://d123.cloudfront.net/tree

There are two common ways to serve content with pretty URLs:
* Redirect from semantic URLs similar to `(b)` to the URLs similar to `(a)` accepted by the origin
* Rewrtie simantic URLs similar to `(b)` to URLs similar to `(a)` accepted by the origin. This can be done either at the origin itself or an intermediate proxy.

We will cover both of these approaches with Lambda@Edge.

### 1. Redirect response generation

Let's generate redirects from the named cards ("tree", "cat", etc) like  
https://d123.cloudfront.net/tree  

to the actual card URL  
https://d123.cloudfront.net/card/da8398f4

#### 1.1 Create a Lambda function

reate a Lambda function in the `us-east-1` region, `Node.js 6.10` runtime and the IAM role named `ws-lambda-edge-full-access-<UNIQUE_ID>`.

Use JavaScript code from [ws-lambda-edge-redirect.js](./ws-lambda-edge-redirect.js) as a blueprint.

![x](./img/01-create-function.png)

#### 1.2 Validate in Lambda console

Click "Save and Test" and configure the test event. You can use the "CloudFront HTTP Redirect" event template. 

Specify `/r/tree` as the value of the `uri` fields.

![x](./img/03-configure-test-object.png)

Click "Test" and validate the function has returned `302` status code with the location header value equal to `/card/da8398f4`.

![x](./img/04-test-invoke-successful.png)

#### 1.3 Publish a function version

Choose "Publish new version" under "Actions", specify an optional description of a function version and click "Publish".

#### 1.4 Create a cache behavior

Go to CloudFront Console and find the distribution created for this workshop. Under the "Behaviors" tab, click "Create Behavior". Choose the following settings:
* Path Pattern: `/r/*`
* Viewer Protocol Policy: "Redirect HTTP to HTTPS"
* Lambda Function Associations: Origin Request = <lambda version ARN from the previous step>
  
![x](./img/05-create-cache-behavior.png)

#### 1.4 Redirects now work!

You can test it with command line

```
curl --head https://d1ctqrad8iuo6u.cloudfront.net/r/tree

HTTP/1.1 302 Moved Temporarily
Content-Length: 0
Connection: keep-alive
Server: CloudFront
Date: Tue, 21 Nov 2017 20:08:35 GMT
Location: /card/da8398f4
Age: 41
X-Cache: Hit from cloudfront
Via: 1.1 5d89a565ccf3467bf90667ebfc36953c.cloudfront.net (CloudFront)
X-Amz-Cf-Id: Qz81dgRMzEiac5P5cvxfuXXZRe7ub_MTUQ8PozB1t0ogSkBYSrRMXg==
```

Or by navigating you web browser to  
https://d123.cloudfront.net/r/tree  

which now should be redirected to  
https://d123.cloudfront.net/card/da8398f4  

### 2. URI rewrite

The URI rewrite approach has two advantages over the redirect:
* Faster content delivery as there is now need for an extra round-trip between the server and the client to handle the redirect
* The semantic URL stays in the address bar of the web browser

Let's rewrite the pretty URIs ("/tree", "/cat", etc) like  
https://d123.cloudfront.net/r/tree  

to the actual card URL internally within Lambda@Edge so that it's not even seen in the viewer web browser.
https://d123.cloudfront.net/card/da8398f4


#### 2.1 Create/modify the Lambda function

Assuming Lab 2 has been completed, we already have Lambda@Edge function triggered for the origin-request event in the default cache behavior. We no need to rewrite the URI at the begging of it before any futher processing.

This can be achieved with the code snippet below. Paste it at the beginning of `ws-lambda-at-edge-generate-card-page` function created in Lab 2.

```
    const redirects = {
        '/music':    '/card/bcbd2481',
        '/tree':     '/card/da8398f4',
        '/food':     '/card/e51c848c',
        '/computer': '/card/fe2f80a7',
        '/cat':      '/card/k9b430fc',
        '/beer':     '/card/vc7efa69',
    };
    if (request.uri in redirects) {
        request.uri = redirects[request.uri];
    }
```

![x](./img/11-modify-function.png)

#### 2.2 Validate in Lambda console

Update the test event, click "Configure test events" inside the dropdown list of test events next to the "Test" button.

![x](./img/12-configure-test-event.png)

Change the `uri` field value to `/tree`.

![x](./img/13-configure-test-event.png)

#### 2.3 Publish a function version

Choose "Publish new version" under "Actions", specify an optional description of a function version and click "Publish".

#### 2.4 Update the trigger

Either in Lambda or CloudFront Console update the origin-request event of the CloudFront distribution to trigger the function version ARN obtained at the previous step.

#### 2.5 URI rewrite now works!

Now both URLs show exactly the same content.

* https://d123.cloudfront.net/tree
* https://d123.cloudfront.net/card/da8398f4  
