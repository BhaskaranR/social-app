require('source-map-support').install();

import { ApolloOptions, graphiqlHapi } from 'apollo-server';
import { Request, Server } from 'hapi';
import { amqpUrl, optionsObject, seneca } from './setup';

import { apolloHapi } from 'apollo-server';
import { apolloSeneca } from './apollo/senecaApollo';

let config = require('config');
var utilities = require('karmasoc-util');
var log = utilities.logger;

// var argv = require('yargs')
//   .usage('Usage: $0 -host [str] -port [num]')
//   .demand(['host', 'port'])
//   .argv;


// Hapi interface
const server = new Server({
  debug: {
    log: ['error'],
    request: ['read']
  }
});

const HOST = '0.0.0.0';
const PORT = '9999';

server.connection({
  port: PORT,
  routes: {
         cors: {
            origin: ['*'],
            credentials: true,
            exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'authorization']

        }
  }
});

 server.register({
   register: apolloHapi,
   options: {
     path: '/graphql',
     apolloOptions: (request: Request) => {
       let user_id = request.headers["user_id"] || "5927739572cf0d52b8a97a72";
       log.info(`user request from --> ${user_id}`)
       optionsObject.context["requesting_user_id"] = user_id;
       return optionsObject;
     }
   },
 }, (err) => {

   if (err) {
     throw err;
   }
 });

log.info('make sure to run karmasoc web server locally');

server.register({
  register: graphiqlHapi,
  options: {
    path: '/graphiql',
    graphiqlOptions: {
      endpointURL: '/graphql'
    },
  },
});

// Start the server
server.start((err) => {

  if (err) {
    throw err;
  }
  log.info('Server running at:', server.info.uri);
});


// Seneca Interface

const patternPin = 'role:graphql';

seneca
  .add(patternPin + ',cmd:execute', apolloSeneca(optionsObject))
  .listen({
    type: 'amqp',
    url: amqpUrl,
    pin: patternPin
  });
