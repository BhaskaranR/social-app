require('source-map-support').install();

import { amqpUrl, optionsObject, seneca } from './setup';

import { apolloSeneca } from './apollo/senecaApollo';

let config = require('config');


// Set up seneca interface role
const patternPin = 'role:graphql-local';

seneca
    .add(patternPin + ',cmd:execute', apolloSeneca(optionsObject))
    .listen({
        type: 'amqp',
        url: amqpUrl,
        pin: patternPin
    });

