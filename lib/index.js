'use strict';

const Hoek = require('@hapi/hoek');
const Response = require('./response');
const Validation = require('./validation');


exports.lambda = function(lambda) {
  const _lambda = async function(event, context) {
    const validate = Hoek.reach(lambda, 'validate');
    let result;

    try {
      if (validate) {
        await Validation.validate(event, validate);
      }

      result = await lambda.handler(event, new Response());
    } catch (error) {
      result = error;
    }

    if (result instanceof Response) {
      return result;
    }

    return new Response(result);
  };

  _lambda.validate = lambda.validate;

  return _lambda;
};

