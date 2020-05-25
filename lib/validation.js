'use strict';

const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');
const Joi = require('@hapi/joi');


const internals = {};


exports.validate = async function(event, validate) {
  if (validate.headers) {
    await internals.validate('headers', event, validate);
  }

  if (validate.params) {
    await internals.validate('params', event, validate);
  }

  if (validate.query) {
    await internals.validate('query', event, validate);
  }

  if (validate.payload) {
    return await internals.validate('payload', event, validate);
  }
};

internals.validate = async function(source, event, validate) {
  const {headers, query, params, payload} = event;

  const options = {
    context: {headers, query, params, payload}
  };

  let value;
  let validationError;
  const schema = validate[source];
  delete options.context[source];

  Hoek.merge(options, validate.options);

  const valueToValidate = Hoek.reach(event, source);

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
