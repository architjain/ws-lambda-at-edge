TBD:

We can serve different content from S3 bucket by changing the path prefix
depending on CloduFront headers:

  CloudFront-Is-Mobile-Viewer
  CloudFront-Is-Desktop-Viewer
  etc

For example:
  GET /image/k9b430fc.jpg

can be rewritten to
  GET /960w/k9b430fc.jpg       # for desktop viewers
  GET /640w/k9b430fc.jpg       # for mobile viewers
