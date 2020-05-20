# Client
A client to invoke a medial lambda

## Example:

```
const Lambda = require('@medial/lambda');

exports.hello = async function() {
  const result = await Lambda.invoke({
    FunctionName: 'medial-example-dev-get'
  });
};

```

## API

### `invoke(params)`
Where params is exactly the params [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property)
