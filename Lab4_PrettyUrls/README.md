## Lab 4: Pretty URLs

In this lab, we will use Lambda@Edge to introduce pretty semantic URLs to our web application. Pretty URLs are easy to read and remember, they also help with search engine optimization and allow your viewers to use the descriptive links in social media.

Currently, we display card details at the URL like this one:  
`(a)` https://d123.cloudfront.net/card/da8398f4  
an example of the corresponding semantic URL would be something like:  
`(b)` https://d123.cloudfront.net/tree

There are two common ways to serve content with pretty URLs:
* Accept request to the semantic URLs `(b)` and redirect it to the URLs accepted by the origin `(a)`
* Rewrtie URIs at your proxy or an origin web server before the content is served.

We will cover both of these approaches with Lambda@Edge.


### 1. Redirect response generation

#### 1.1 Create a Lambda function

TBD

#### 1.2 Validate in lambda console

TBD 

#### 1.3 Create a cache behavior

TBD

#### 1.4 Redirects now work!

TBD

### 2. URI rewrite

#### 2.1 Create/modify the Lambda function

TBD

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


#### 2.2 Validate in lambda console

TBD

#### 2.3 URI rewrite now works!

TBD
