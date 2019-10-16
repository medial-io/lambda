'use strict';

const Joi = require('@hapi/joi');

const Medial = require('../');

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

      const lambda = Medial.lambda(handler);
      const result = await lambda({params: {a: '1'}});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({query: {a: '1'}});

      expect(result).toEqual({
        headers: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({payload: {a: '1'}});

      expect(result).toEqual({
        headers: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
        statusCode: 200,
        body: undefined
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
        statusCode: 200,
        body: undefined
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
        statusCode: 200,
        body: undefined
      });
    });
  });

  describe('toolkit is used to set the response and code', () => {
    it('params', async () => {
      const handler = {
        validate: {
          params: {
            a: Joi.string().required()
          }
        },
        handler: async function(request, h) {
          return h.response({hello: 'world'}).code(201);
        }
      };

      const lambda = Medial.lambda(handler);
      const result = await lambda({params: {a: '1'}});

      expect(result).toEqual({
        headers: {},
        statusCode: 201,
        body: JSON.stringify({hello: 'world'})
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
          return h.response({hello: 'world'}).code(201);
        }
      };

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
        statusCode: 201,
        body: JSON.stringify({hello: 'world'})
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
          return h.response({hello: 'world'}).code(201);
        }
      };

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
        statusCode: 201,
        body: JSON.stringify({hello: 'world'})
      });
    });
  });

  describe('successfully returns a lambda that has no validation defined', () => {
    it('params', async () => {
      const handler = {
        handler: async function(request, h) {
          return request.params;
        }
      };

      const lambda = Medial.lambda(handler);
      const result = await lambda({params: {a: '1'}});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({query: {a: '1'}});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({payload: {a: '1'}});

      expect(result).toEqual({
        headers: {},
        statusCode: 200,
        body: JSON.stringify({a: '1'})
      });
    });
  });

  describe('handles a lambda that fails validation and responds with a customer error', () => {
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({});

      expect(result).toEqual({
        headers: {},
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

      const lambda = Medial.lambda(handler);
      const result = await lambda({payload: {a: 1}});

      expect(result).toEqual({
        headers: {},
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

    const lambda = Medial.lambda(handler);
    const result = await lambda({});

    expect(result).toEqual({
      headers: {},
      statusCode: 500,
      body: JSON.stringify({
        message: 'bad bad thing'
      })
    });
  });
});
