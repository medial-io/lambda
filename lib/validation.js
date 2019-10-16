'use strict';

const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');
const Joi = require('@hapi/joi');


const internals = {};


exports.validate = async function(event, validate) {
  event.orig = {};

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
  return await internals.validate('query', event, validate);
};

internals.params = async function(event, validate) {
  return await internals.validate('params', event, validate);
};

internals.payload = async function(event, validate) {
  return await internals.validate('payload', event, validate);
};

internals.validate = async function(source, event, validate) {
  const options = {
    context: {
      query: event.query,
      params: event.params,
      payload: event.payload
    }
  };

  let value;
  let validationError;
  const schema = validate[source];
  delete options.context[source];

  Hoek.merge(options, validate.options);

  const valueToValidate = Hoek.reach(event, source, {default: {}});

  try {
    const compiledSchema = Joi.compile(schema);
    value = await compiledSchema.validateAsync(valueToValidate, options);
    return;
  } catch (error) {
    validationError = error;
  } finally {
    // eslint-disable-next-line require-atomic-updates
    event.orig[source] = valueToValidate;
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
