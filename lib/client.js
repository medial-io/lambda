'use strict';

const AWS = require('aws-sdk');

const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');
const Joi = require('@hapi/joi');

const lambda = new AWS.Lambda();

const internals = {
  schema: Joi.object().keys({
    FunctionName: Joi.string().required(),
    InvocationType: Joi.string().valid('Event', 'RequestResponse', 'DryRun').default('RequestResponse'),
    LogType: Joi.string().valid('Tail'),
    Payload: Joi.any(),
    Qualifier: Joi.string()
  })
};

exports.invoke = async function(params) {
  const _params = await internals.schema.validateAsync(params);

  let lambdaResult;

  try {
    lambdaResult = await lambda.invoke(_params).promise();
  } catch (err) {
    throw Boom.boomify(err);
  }

  const {StatusCode, Payload} = lambdaResult;

  if (StatusCode >= 400) { // This should never happen per AWS Lambda docs
    throw new Boom.Boom(undefined, {statusCode: StatusCode, data: Payload});
  }

  const payload = JSON.parse(Payload);

  if (Hoek.reach(payload, 'errorType')) {
    throw Boom.badImplementation(undefined, payload);
  }

  const {statusCode, body} = payload; // note the lowercase statusCode
  let result = payload; // maybe it is not a medial lambda

  try {
    if (body) {
      result = JSON.parse(body);
    }
  } catch (err) {
    return body;
  }

  if (statusCode > 399) { // error occured
    throw new Boom.Boom(result.message, {statusCode});
  }

  return result;
};
