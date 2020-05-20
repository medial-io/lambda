/* eslint-disable require-jsdoc */
'use strict';

const Response = require('./response');


class ResponseToolkit {
  constructor(context) {
    this.context = context;
  }

  response(result) {
    return new Response(result);
  }
}

module.exports = ResponseToolkit;
