import * as Bluebird from 'bluebird';
import * as Seneca from 'seneca';

import { ApolloOptions } from 'apollo-server';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { createLoaders } from './database';
import myGraphQLSchema from './schema';
import resolveFunctions from "./resolvers";

let config = require('config');

addResolveFunctionsToSchema(myGraphQLSchema, resolveFunctions);


export const seneca = Seneca({
  actcache: {
    active: true,
    size: 257
  }
});

export const amqpUrl = config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`;


seneca
  .use('seneca-amqp-transport')
  .client({
    type: 'amqp',
    pin: 'role:user',
    url: amqpUrl
  }).client({
    type: 'amqp',
    pin: 'role:reporter',
    url: amqpUrl
  });


export let optionsObject: ApolloOptions = {
  schema: myGraphQLSchema,
  context: {
    loaders: createLoaders(),
    basicSenecaPattern: null
  },
  debug: true
};

export const pact = Bluebird.promisify(seneca.act, {context: seneca});