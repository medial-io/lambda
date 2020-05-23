'use strict';

const Joi = require('@hapi/joi');

const Lambda = require('../');

describe('Medial lambda', () => {
  describe('successfully returns a lambda that validates', () => {
    it('params', async () => {
      const handler = {
        validate: {
          params: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return request.params;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({pathParameters: {a: '1'}});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
      });
    });

    it('query', async () => {
      const handler = {
        validate: {
          query: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return request.query;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({queryStringParameters: {a: '1'}});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
      });
    });

    it('query with parameters that are an array', async () => {
      const handler = {
        validate: {
          query: {
            a: Joi.string().required(),
            b: Joi.array().items(Joi.string()).required()
          }
        },
        handler: async function(request, h) {
          return request.query;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({
        queryStringParameters: {a: '1', b: '3'},
        multiValueQueryStringParameters: {a: ['1'], b: ['2', '3']}
      });

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({a: '1', b: ['2', '3']})
      });
    });

    it('payload', async () => {
      const handler = {
        validate: {
          payload: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return request.payload;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({body: JSON.stringify({a: '1'})});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
      });
    });
  });

  describe('successfully returns a lambda that handles empty string for', () => {
    it('params', async () => {
      const handler = {
        validate: {
          params: {
            a: Joi.string()
          }
        },
        handler: async function(request, h) {
          return request.params;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({pathParameters: ''});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({})
      });
    });

    it('query', async () => {
      const handler = {
        validate: {
          query: {
            a: Joi.string()
          }
        },
        handler: async function(request, h) {
          return request.query;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({queryStringParameters: ''});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({})
      });
    });

    it('payload', async () => {
      const handler = {
        validate: {
          payload: {
            a: Joi.string()
          }
        },
        handler: async function(request, h) {
          return request.payload;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({body: ''});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({})
      });
    });
  });

  describe('handles a lambda that fails validation and responds with an error', () => {
    it('params', async () => {
      const handler = {
        validate: {
          params: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return request.params;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: 'Bad Request',
          message: '"a" is required',
          validation: {
            source: 'params',
            keys: ['a']
          }
        })
      });
    });

    it('query', async () => {
      const handler = {
        validate: {
          query: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return request.query;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: 'Bad Request',
          message: '"a" is required',
          validation: {
            source: 'query',
            keys: ['a']
          }
        })
      });
    });

    it('payload - incorrect payload is provided', async () => {
      const handler = {
        validate: {
          payload: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return request.payload;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: 'Bad Request',
          message: '"a" is required',
          validation: {
            source: 'payload',
            keys: ['a']
          }
        })
      });
    });

    it('payload with empty string is provided', async () => {
      const handler = {
        validate: {
          payload: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return request.payload;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({body: 'a string'});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: 'Bad Request',
          message: '"value" must be of type object',
          validation: {
            source: 'payload',
            keys: ['']
          }
        })
      });
    });
  });

  describe('handles a lambda that has valdiation attribute "failAction" is set to "ignore"', () => {
    it('params', async () => {
      const handler = {
        validate: {
          params: {
            a: Joi.string().required()
          },
          failAction: 'ignore'
        },
        handler: async function(request, h) {
          return request.params;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: '{}'
      });
    });

    it('query', async () => {
      const handler = {
        validate: {
          query: {
            a: Joi.string().required()
          },
          failAction: 'ignore'
        },
        handler: async function(request, h) {
          return request.query;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: '{}'
      });
    });

    it('payload', async () => {
      const handler = {
        validate: {
          payload: {
            a: Joi.string().required()
          },
          failAction: 'ignore'
        },
        handler: async function(request, h) {
          return request.payload;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: '{}'
      });
    });
  });

  it('toolkit is used to set the response and code', async () => {
    const handler = {
      handler: async function(request, h) {
        return h.response({hello: 'world'}).code(201);
      }
    };

    const lambda = Lambda.define(handler);
    const result = await lambda({pathParameters: {a: '1'}});

    expect(result).toEqual({
      multiValueHeaders: {},
      statusCode: 201,
      body: JSON.stringify({hello: 'world'})
    });
  });

  it('response is used to set the message/body, code and header', async () => {
    const handler = {
      handler: async function(request, h) {
        return h.response().message({hello: 'world'}).header('my-header', 'my-value').code(201);
      }
    };

    const lambda = Lambda.define(handler);
    const result = await lambda();

    expect(result).toEqual({
      multiValueHeaders: {'my-header': ['my-value']},
      statusCode: 201,
      body: JSON.stringify({hello: 'world'})
    });
  });

  it('response is used to set the message/body, code and multiple headers with the same key', async () => {
    const handler = {
      handler: async function(request, h) {
        return h.response()
            .message({hello: 'world'})
            .header('set-cookie', 'cookieKey=cookieValue; Domain=yourdomain.com; Secure; HttpOnly')
            .header('set-cookie', 'cookieKey1=cookieValue1; Domain=yourdomain.com; Secure; HttpOnly', {append: true})
            .code(200);
      }
    };

    const lambda = Lambda.define(handler);
    const result = await lambda();

    expect(result).toEqual({
      multiValueHeaders: {
        'set-cookie': [
          'cookieKey=cookieValue; Domain=yourdomain.com; Secure; HttpOnly',
          'cookieKey1=cookieValue1; Domain=yourdomain.com; Secure; HttpOnly'
        ]
      },
      statusCode: 200,
      body: JSON.stringify({hello: 'world'})
    });
  });

  it('response is used to set the message/body, code and header with append set to true', async () => {
    const handler = {
      handler: async function(request, h) {
        return h.response()
            .message({hello: 'world'})
            .header('set-cookie', 'cookieKey=cookieValue; Domain=yourdomain.com; Secure; HttpOnly', {append: true})
            .code(200);
      }
    };

    const lambda = Lambda.define(handler);
    const result = await lambda();

    expect(result).toEqual({
      multiValueHeaders: {
        'set-cookie': ['cookieKey=cookieValue; Domain=yourdomain.com; Secure; HttpOnly']
      },
      statusCode: 200,
      body: JSON.stringify({hello: 'world'})
    });
  });

  describe('successfully returns a lambda that has no validation defined', () => {
    it('params', async () => {
      const handler = {
        handler: async function(request, h) {
          return request.params;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({pathParameters: {a: '1'}});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
      });
    });

    it('query', async () => {
      const handler = {
        handler: async function(request, h) {
          return request.query;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({queryStringParameters: {a: '1'}});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
      });
    });

    it('payload', async () => {
      const handler = {
        handler: async function(request, h) {
          return request.payload;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({body: {a: '1'}});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
      });
    });
  });

  describe('handles a lambda that fails validation and responds with a custom error', () => {
    it('params', async () => {
      const handler = {
        validate: {
          params: {
            a: Joi.string().required().error(new Error('bad bad'))
          }
        },
        handler: async function(request, h) {
          return request.params;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: 'Bad Request',
          message: 'bad bad',
          validation: {
            source: 'params',
            keys: []
          }
        })
      });
    });

    it('query', async () => {
      const handler = {
        validate: {
          query: {
            a: Joi.string().required().error(new Error('bad bad'))
          }
        },
        handler: async function(request, h) {
          return request.query;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: 'Bad Request',
          message: 'bad bad',
          validation: {
            source: 'query',
            keys: []
          }
        })
      });
    });

    it('payload', async () => {
      const handler = {
        validate: {
          payload: {
            a: Joi.string().error(new Error('bad bad'))
          }
        },
        handler: async function(request, h) {
          return request.payload;
        }
      };

      const lambda = Lambda.define(handler);
      const result = await lambda({body: JSON.stringify({a: 1})});

      expect(result).toEqual({
        multiValueHeaders: {},
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: 'Bad Request',
          message: 'bad bad',
          validation: {
            source: 'payload',
            keys: []
          }
        })
      });
    });
  });

  it('handles a lambda that throws a non-Boom error', async () => {
    const handler = {
      handler: async function() {
        throw new Error('bad bad thing');
      }
    };

    const lambda = Lambda.define(handler);
    const result = await lambda({});

    expect(result).toEqual({
      multiValueHeaders: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'bad bad thing'
      })
    });
  });
});
