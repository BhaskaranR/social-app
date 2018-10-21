'use strict';
const searchRoutes = [];
const searchHandler = require('../controllers/searchController');


searchRoutes.push({
    method: 'GET',
    path: '/me/search',
    handler: searchHandler.search,
    config: {
        description: 'Get general search',
        notes: 'Get general search',
        tags: ['api', 'search', 'all'],
        auth: 'jwt'
    }
})


searchRoutes.push({
    method: 'GET', path: '/me/suggest',
    handler: searchHandler.suggest,
    config: {
        description: 'Get general suggestion',
        notes: 'Get general suggestion',
        tags: ['api', 'suggestion', 'all'],
        auth: 'jwt'
    }
})


module.exports.routes = searchRoutes;
