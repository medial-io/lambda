'use strict';

const Boom = require('@hapi/boom');
const {Lambda} = require('aws-sdk');

const lambdaInvoke = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue({
    StatusCode: 200,
    Payload: JSON.stringify({
      body: JSON.stringify({
        hello: 'world'
      })
    })
  })
});

Lambda.mockImplementation(() => ({
  invoke: lambdaInvoke
}));

const LambdaClient = require('../lib');


describe('Invoke Lambda', () => {
  beforeEach(async () => {
    lambdaInvoke.mockClear();
  });

  it('successfully invokes lambda without a payload', async () => {
    const result = await LambdaClient.invoke({FunctionName: 'test'});
    expect(result).toEqual({
      hello: 'world'
    });
    expect(lambdaInvoke).toHaveBeenCalledTimes(1);
    expect(lambdaInvoke).toHaveBeenCalledWith({FunctionName: 'test', InvocationType: 'RequestResponse'});
  });

  it('successfully invokes lambda with a payload', async () => {
    const result = await LambdaClient.invoke({FunctionName: 'test', Payload: 'test'});
    expect(result).toEqual({
      hello: 'world'
    });
    expect(lambdaInvoke).toHaveBeenCalledTimes(1);
    expect(lambdaInvoke).toHaveBeenCalledWith({
      FunctionName: 'test',
      InvocationType: 'RequestResponse',
      Payload: 'test'
    });
  });

  it('handles boom error invoking the lambda', async () => {
    lambdaInvoke.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        StatusCode: 200,
        Payload: JSON.stringify(Boom.notFound('boo boo').output.payload)
      })
    });

    await expect(LambdaClient.invoke({FunctionName: 'test', Payload: 'test'}))
        .rejects.toThrow({statusCode: 404, error: 'Not Found', message: 'boo boo'});
  });

  it('handles lambda errors', async () => {
    lambdaInvoke.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        StatusCode: 200,
        Payload: JSON.stringify({errorType: 'someAWSError', a: 1, b: 2})
      })
    });

    await expect(LambdaClient.invoke({FunctionName: 'test', Payload: 'test'}))
        .rejects.toThrow(Boom.badImplementation(undefined, {errorType: 'someAWSError', a: 1, b: 2}));
  });

  it('handles lambda statusCode other than 2xx', async () => {
    lambdaInvoke.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        StatusCode: 500,
        Payload: {a: 1, b: 2}
      })
    });

    await expect(LambdaClient.invoke({FunctionName: 'test', Payload: 'test'}))
        .rejects.toThrow(Boom.badImplementation(undefined, {a: 1, b: 2}));
  });

  it('handles lambda invocation errors', async () => {
    lambdaInvoke.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('some thing bad happened'))
    });

    await expect(LambdaClient.invoke({FunctionName: 'test', Payload: 'test'}))
        .rejects.toThrow(Boom.badImplementation('some thing bad happened'));
  });

  it('handles body/payload parsing', async () => {
    lambdaInvoke.mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        StatusCode: 200,
        Payload: JSON.stringify({statusCode: 200, body: {a: 1, b: 2}})
      })
    });

    const result = await LambdaClient.invoke({FunctionName: 'test', Payload: 'test'});

    expect(result).toEqual({a: 1, b: 2});
  });
});
