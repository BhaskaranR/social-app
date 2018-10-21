'use strict';
const seneca = require('seneca')();
const messages = require('./lib/messages');
const conversations = require('./lib/conversations');
const database = require('./lib/database');
const util = require('karmasoc-util');

const patternPin = 'role:messenger';

// init database and then seneca and expose functions
database.connect()
    .then(() => {
        seneca
            .use('seneca-amqp-transport')
            .add(patternPin + ',cmd:newmessage,message_type:text', messages.newTextMessage)
            .add(patternPin + ',cmd:newmessage,message_type:post', messages.newPostMessage)
            .add(patternPin + ',cmd:getmessagesbyconversationid', messages.getMessagesByConversationId)
            .add(patternPin + ',cmd:latestmessages,distict:conversation', messages.getLatestMessagesByDistinctConversation)
            .add(patternPin + ',cmd:newconversation', conversations.newConversation)
            .add(patternPin + ',cmd:getconversationsbyuser', conversations.getConversationsByUserId)
            .add(patternPin + ',cmd:getconversationbyid', conversations.getConversationById)
            .add(patternPin + ',cmd:ackConverstaion', conversations.ackConversation);

        seneca.listen({
            type: 'amqp',
            url: config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`,
            pin: patternPin
        });
    });