'use strict';
const messengerRoutes = [];
const messagerhandler = require('../controllers/messengerController');
const messengervalidation = require('../validations/messengerValidation');


messengerRoutes.push({
    method: 'GET',
    path: '/conversations/{conversationId}',
    handler: messagerhandler.getConversationById,
    config: {
        auth: 'jwt',
        description: 'Get conversation by its id',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: messengervalidation.conversationId
        }
    }
});

messengerRoutes.push({
    method: 'POST',
    path: '/conversations',
    handler: messagerhandler.postConversation,
    config: {
        auth: 'jwt',
        description: 'Create new conversation with one or more people',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            payload: messengervalidation.postConversation
        }
    }
});


messengerRoutes.push({
    method: 'GET',
    path: '/my/conversations',
    handler: messagerhandler.getMyConversations,
    config: {
        auth: 'jwt',
        description: 'Get a list of my (currently logged in user) conversations',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation'],
    }
});


messengerRoutes.push({
    method: 'GET',
    path: '/messages/{conversationId}',
    handler: messagerhandler.getMessagesByConversationId,
    config: {
        auth: 'jwt',
        description: 'Get messages by conversationId',
        notes: 'Returns n messages, n depends on query param "elements".',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: messengervalidation.conversationId,
            query: messengervalidation.dataPaged
        }
    }
});

messengerRoutes.push({
    method: 'POST',
    path: '/messages/{messageType}',
    handler: messagerhandler.postMessage,
    config: {
        auth: 'jwt',
        description: 'Send new message',
        notes: 'returns _id of created message, currently supported message types are text and location',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: messengervalidation.messageType,
            payload: messengervalidation.message
        }
    }
});

messengerRoutes.push({
    method: 'POST',
    path: '/conversations/{conversationId}/ack',
    handler: messagerhandler.ackConversation,
    config: {
        auth: 'jwt',
        description: 'Acknowledge a conversation by timestamp',
        notes: 'returns nothing if everything was ok',
        tags: ['api', 'messenger', 'conversation', 'ackack'],
        validate: {
            params: messengervalidation.conversationId,
            payload: messengervalidation.ackPayload
        }
    }
});

module.exports.routes = messengerRoutes;