'use strict';

const AWS = jest.genMockFromModule('aws-sdk');

const {Lambda} = AWS;

Lambda.mockImplementation(() => ({
  invoke: () => {}
}));

AWS.Lambda = Lambda;

module.exports = AWS;
