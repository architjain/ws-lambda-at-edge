=== Assignment 2: Simple API ===

Before going any further, any web application needs to store and change its state
in a server side database.

In our example, we want to count "likes" each of the item receives so that
we can rate them.

Let's build a simple API that allows us to store the state in a DynamoDB table.

1. Create API for accepting likes

   POST /api/like?id=<item_id>

1.1. Create Lambda function

     Existing role: ws-lambda-edge-full-access-<UNIQUE_ID>
     Use the blueprint: ./ws-lambda-at-edge-api-like.js

1.2. Create cache behavior

1.3. Validate the API

     curl -X POST https://d3rugkzdgfe4op.cloudfront.net/api/like?id=da8398f4

     {
        "ItemId": "da8398f4",
        "Likes": 12
     }
