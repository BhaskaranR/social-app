'use strict';

const Joi = require('joi');

const validations = {};

validations.mongoId = Joi.string().optional();
validations.mongoIdRequired = Joi.string().required();

validations.basicMessage = Joi.object().keys({
    conversation_id: validations.mongoIdRequired,
    from: validations.mongoIdRequired,
    timestamp: Joi.number()
});

validations.textMessage = validations.basicMessage.keys({
    message: Joi.string().required()
});

validations.postMessage = validations.basicMessage.keys({
    post_id: validations.mongoIdRequired
});


validations.messagesByConversationId = Joi.object().keys({
    conversation_id: validations.mongoIdRequired,
    query: Joi.object().keys({
        page: Joi.number(),
        elements: Joi.number().min(1)
    }).and('page', 'elements')
});

validations.latestMessages = Joi.object().keys({
    user_id: validations.mongoIdRequired,
    query: Joi.object().keys({
        count: Joi.number().min(1)
    })
});

let participant = Joi.object().keys({
    user_id: validations.mongoIdRequired,
    last_read: Joi.number().optional().default(0)
});

validations.newConversation = Joi.object().keys({
    participants: Joi.array().items(participant).min(2)
});

validations.userId = Joi.object().keys({
    user_id: validations.mongoIdRequired
});

validations.conversationId = Joi.object().keys({
    conversation_id: validations.mongoIdRequired
});

validations.conversationAck = participant.keys({
    conversation_id: validations.mongoIdRequired
});

module.exports = validations;