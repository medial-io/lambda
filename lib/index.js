'use strict';

const mergeWith = require('lodash.mergewith');
const Hoek = require('@hapi/hoek');
const Client = require('./client');
const ResponseToolkit = require('./response-toolkit');
const Response = require('./response');
const Validation = require('./validation');

const internals = {};

exports.define = function(handlerObj) {
  const lambda = async function(event={}, context={}) {
    const validate = Hoek.reach(handlerObj, 'validate');
    let result;

    internals.setup(event);

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

internals.setup = function(event) {
  internals.setupHeaders(event);
  internals.setupQuery(event);
  internals.setupParams(event);
  internals.setupPayload(event);
};

internals.setupHeaders = function(event) {
  event.headers = internals.setupMultiValue(event, 'input.headers', 'input.multiValueHeaders');
};

internals.setupQuery = function(event) {
  event.query = internals.setupMultiValue(event, 'queryStringParameters', 'multiValueQueryStringParameters');
};

internals.setupParams = function(event) {
  event.params = internals.getLambdaValue(event, 'pathParameters');
};

internals.setupPayload = function(event) {
  const getPayload = function(payload) {
    if (payload) {
      try {
        return JSON.parse(payload);
      } catch (error) {
        return payload;
      }
    }

    return {};
  };

  event.payload = getPayload(event.body);
};

internals.setupMultiValue = function(event, lambdaSource, lambdaMultiValueSource) {
  const stringParameters = Hoek.clone(internals.getLambdaValue(event, lambdaSource));
  const multiValueParameters =internals.getLambdaValue(event, lambdaMultiValueSource);

  const mergeCustomizer = function(objValue, srcValue) {
    if (srcValue.length > 1) {
      return srcValue;
    }

    return objValue;
  };

  return mergeWith(stringParameters, multiValueParameters, mergeCustomizer);
};

internals.getLambdaValue = function(event, source) {
  // event can be {pathParameters: ''} ahd Hoek.reack will return the empty string ''
  return Hoek.reach(event, source, {default: {}}) || {};
};


exports.invoke = Client.invoke;

