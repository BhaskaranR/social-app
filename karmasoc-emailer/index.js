'use strict';

// load environment variables
const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
let config = require('config');

const seneca = require('seneca')();
const mailer = require('./lib/mailer');


// select desired transport method
const patternPin = 'role:mailer';

seneca.use('seneca-amqp-transport');
let amqpUrl = config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`;
// init seneca and expose functions
seneca
    .add(patternPin + ',cmd:send,subject:pwforget,', mailer.sendPwForgottenMail)
    .add(patternPin + ',cmd:send,subject:generic,', mailer.sendGenericMail)
    .add(patternPin + ',cmd:send,subject:confirmMail', mailer.sendConfirmationMail);

seneca
    .listen({
        type: 'amqp',
        url: amqpUrl,
        pin: patternPin
    })
    .client({
        type: 'amqp',
        url: amqpUrl,
        pin: 'role:user'
    });