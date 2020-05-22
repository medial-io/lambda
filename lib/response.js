/* eslint-disable require-jsdoc */
'use strict';

const internals = {};


class Response {
  constructor(result) {
    this._build(result);
  }

  _build(result) {
    const {headers, statusCode, body} = internals.build(result);

    this.multiValueHeaders = headers;
    this.statusCode = statusCode;
    this.body = body;
  }

  code(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  header(key, value, options = {}) {
    const append = options.append || false;
    const _key = key.toLowerCase();

    if (append) {
      this.multiValueHeaders[_key] = [].concat(this.multiValueHeaders[_key] || [], value);
      return this;
    }

    this.multiValueHeaders[_key] = [value];
    return this;
  }

  message(result) {
    this._build(result);
    return this;
  }
}

internals.build = function(result) {
  if (result instanceof Error) {
    return internals.error(result);
  }

  return internals.success(result);
};

internals.error = function(error) {
  if (error.isBoom) {
    return internals.buildResponse(error.output.statusCode, error.output.headers, error.output.payload);
  }

  return internals.buildResponse(500, {}, {message: error.message});
};

internals.success = function(body) {
  return internals.buildResponse(200, {}, body);
};

internals.buildResponse = function(statusCode, headers, body) {
  return {
    headers,
    statusCode,
    body: JSON.stringify(body)
  };
};

module.exports = Response;
