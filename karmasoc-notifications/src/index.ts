'use strict';
require('source-map-support').install();
import * as Seneca from 'seneca';
import * as myModule from './lib/module';
const config = require('config');


const patternPin = 'role:notifications';
const amqpUrl = config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`;


const seneca = Seneca({
    actcache: {     
        active: true,
        size: 257
    }
});
seneca.use('seneca-amqp-transport');

// init seneca
seneca
    .add(patternPin + ',cmd:notify,entity:newShare', myModule.notifyPostNewShare)
    .add(patternPin + ',cmd:notify,entity:newComment', myModule.notifyNewImpression)
    .add(patternPin + ',cmd:notify,entity:newFollower', myModule.notifyNewFollower)
    .add(patternPin + ',cmd:notify,entity:post,action:newLike', myModule.notifyMyPostHasNewLike)

seneca.listen({
    type: 'amqp',
    url: config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`,
    pin: patternPin
}).client({ type: 'amqp', url: amqpUrl, pin: 'role:user' })
;

