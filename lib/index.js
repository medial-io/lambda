'use strict';

const Hoek = require('@hapi/hoek');
const Client = require('./client');
const ResponseToolkit = require('./response-toolkit');
const Response = require('./response');
const Validation = require('./validation');


exports.define = function(handlerObj) {
  const lambda = async function(event, context) {
    const validate = Hoek.reach(handlerObj, 'validate');
    let result;

    try {
      if (validate) {
        await Validation.validate(event, validate);
      }

      result = await handlerObj.handler(event, new ResponseToolkit(context));
    } catch (error) {
      result = error;
    }

    if (result instanceof Response) {
      return result;
    }

    return new Response(result);
  };

  lambda.validate = handlerObj.validate;

  return lambda;
};

exports.invoke = Client.invoke;

