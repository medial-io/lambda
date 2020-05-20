# @medial/lambda

# A wrapper for AWS Lambda 
A wrapper to help build AWS Lambda services.

**Inspired by the [hapi](https://hapi.dev/) framework.**


## Example

Medial Handler Object

```
const Lambda = require('@medial/lambda');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');


exports.get = Lambda.define({
  validate: {
    query: Joi.object().keys({
      world: Joi.string().default('world')
    })
  },
  handler: async function(request, h) {
    const world = request.query.world;

    return {hello: world};
  }
});
```
`exports.get` is AWS Lambda function and when it is configured for HTTP access - when invoked will return ```{"hello": "world"}``` with a response code `200`.

You can also invoke the lambda from another lambda. The response will look like this: 
```
{
  headers: {},
  statusCode: 200,
  body: '{"hello": "world"}' // this is stringifyed object 
}
```

# Documentation
 - [Handler API](docs/HANDLER-API.md)
 - [Client API](docs/CLIENT-API.md)