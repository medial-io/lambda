'use strict';

const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');
const Joi = require('@hapi/joi');


const internals = {};


exports.validate = async function(event, validate) {
  if (validate.params) {
    await internals.params(event, validate);
  }

  if (validate.query) {
    await internals.query(event, validate);
  }

  if (validate.payload) {
    await internals.payload(event, validate);
  }
};

internals.query = async function(event, validate) {
  return await internals.validate('query', 'queryStringParameters', event, validate);
};

internals.params = async function(event, validate) {
  return await internals.validate('params', 'pathParameters', event, validate);
};

internals.payload = async function(event, validate) {
  return await internals.validate('payload', 'body', event, validate);
};

internals.validate = async function(source, lambdaSource, event, validate) {
  const payload = internals.getPayload(event.body);

  const options = {
    context: {
      query: event.queryStringParameters,
      params: event.pathParameters,
      payload
    }
  };

  let value;
  let validationError;
  const schema = validate[source];
  delete options.context[source];

  Hoek.merge(options, validate.options);

  // event can be {queryStringParameters: ''} ahd Hoek.reack will return the empty string ''
  const valueToValidate = lambdaSource === 'body' ? payload : Hoek.reach(event, lambdaSource, {default: {}}) || {};

  try {
    const compiledSchema = Joi.compile(schema);
    value = await compiledSchema.validateAsync(valueToValidate, options);
    return;
  } catch (error) {
    validationError = error;
  } finally {
    if (value !== undefined) {
      // eslint-disable-next-line require-atomic-updates
      event[source] = value;
    }
  }

  if (validate.failAction === 'ignore') {
    return;
  }

  const error = Boom.boomify(validationError, {statusCode: 400, override: false});
  error.output.payload.validation = {source, keys: []};

  if (validationError.details) {
    for (const details of validationError.details) {
      const path = details.path;
      error.output.payload.validation.keys.push(Hoek.escapeHtml(path.join('.')));
    }
  }

  throw validationError;
};

internals.getPayload = function(payload) {
  if (payload) {
    try {
      return JSON.parse(payload);
    } catch (error) {
      return payload;
    }
  }

  return {};
};
