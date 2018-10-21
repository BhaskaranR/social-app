'use strict';
const recroutes = [];
const rechandler = require('../controllers/recommendationController');
const recvalidation = require('../validations/reporterValidation');


recroutes.push({
    method: 'GET',
    path: '/recommendations/business/{userId}',
    handler: rechandler.getRecByUserId,
    config: {
        description: 'Get recommendations by user',
        notes: 'Returns business recommendation for user.',
        tags: ['api', 'business', 'locations'],
        validate: {
            params: recvalidation.userId
        },
        auth: 'jwt'
    }
});

module.exports.routes = recroutes;