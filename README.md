# Supercharge your website with Lamdba@Edge

## Overview

In this workshop you will learn how you can use Lambda@Edge to extend functionality of your web-application or a website.

Region | Button
------------ | -------------
us-east-1 | [![Launch stack in us-east-1](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=WsLambdaAtEdgeAlienCards&templateURL=https://s3.amazonaws.com/ws-lambda-at-edge/bootstrap/cfn-template.json)

## Lab 1 - Security

Security always comes first.

Learn how to check and improve our website security by configuring HTTP to HTTPs redirect and adding a number of standard security headers to enforce HTTPS connection is always used and prevent XSS.

[Lab 1 - Adding Security headers](./Lab1_Security/README.md)

## Lab 2 - Content generation

Learn how to create a Lambda function that dynamically generates HTML content that can be cached by CloudFront and returned back to your viewers.

[Lab 2 - Content generation](./Lab2_ContentGeneration/README.md)

## Lab 3 - Simple API

Learn how you can use Lambda@Edge to implement a simple API that accepts POST requests from the viewers and modifies the web application state in a DynamoDB table.

[Lab 3 - Simple API](./Lab3_SimpleAPI/README.md)

## Lab 4 - Pretty URLs

Use Lambda@Edge to introduce pretty semantic URLs to your web application. Pretty URLs are easy to read and remember, they also help with search engine optimization and allow your viewers to use the descriptive links in social media.

[Lab 4 - Pretty URLs](./Lab4_PrettyUrls/README.md)

## Lab 5 - Customization

TBD - Overview

[Lab 5 - Customization](./Lab5_Customization/README.md)

## Lab 6 - Origin Selection

TBD - Overview

[Lab 6 - Origin Selection](./Lab6_OriginSelection/README.md)

## Cleanup

1. Delete all files from the S3 bucket `ws-lambda-at-edge-<unique_id>` created by CloudFormation stack for this workshop.
1. Delete the CloudFormation stack named `WsLambdaAtEdgeAlienCards`.
