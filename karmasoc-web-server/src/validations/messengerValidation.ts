'use strict';
const _Joi = require('joi');

let messengerValidations: any = {};

let mongoIdField = _Joi.string().optional();
let mongoIdFieldRequired = mongoIdField.required();

messengerValidations.conversationId = _Joi.object().keys({
    conversationId: mongoIdFieldRequired
});

messengerValidations.messageType = _Joi.object().keys({
    messageType: _Joi.string().allow('text', 'location').required()
});

messengerValidations.message = _Joi.object().keys({
    conversation_id: mongoIdFieldRequired,
    location_id: mongoIdField,
    message: _Joi.string()
}).xor('message', 'location_id');

messengerValidations.dataPaged = _Joi.object().keys({
    page: _Joi.number().default(0),
    elements: _Joi.number().default(20)
}).and('page', 'elements');


let participant = _Joi.object().keys({
    user_id: _Joi.string().required()
});

messengerValidations.postConversation = _Joi.object().keys({
    participants: _Joi.array().items(participant).min(1)
});


messengerValidations.ackPayload = _Joi.object().keys({
    last_read: _Joi.number().min(1)
});

module.exports = messengerValidations;