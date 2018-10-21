'use strict';
const Glue = require('glue');
const config = require('config');
const routes = require('./lib/module');
const util = require('karmasoc-util');
const log = util.logger;

console.log(config.get('env.host.karmasoc-mediaserve'));
console.log(config.get('env.port.karmasoc-mediaserve'));

// declare  plugins
var manifest = {
    connections: [{
        port: config.get('env.port.karmasoc-mediaserve')
    }],
    registrations: [
        { plugin: 'inert' },
        { plugin: 'vision' },
        { plugin: 'hapi-swagger' }, {
            plugin: {
                register: 'hapi-mongodb',
                options: {
                    'url': config.get('db.karmasoc-mediaserve.dbcon'),
                    'settings': {
                        'db': {
                            'native_parser': false
                        }
                    }
                }
            }
        }, {
            plugin: {
                register: 'good',
                options: {
                    ops: false,
                    reporters: {
                        console: [{ module: 'good-console' }, 'stdout']
                    }
                }
            }
        }
    ]
};


// compose Server with plugins
Glue.compose(manifest, { relativeTo: __dirname })
    .then(server => {


        server.route(routes);

        server.on('request-error', (request, err) => {

            // log 500 code
            log.fatal('Server Error', {
                error: err,
                requestData: request.orig,
                path: request.path
            });
        });


        // log errors before response is sent back to user
        server.ext('onPreResponse', (request, reply) => {
            const response = request.response;
            if (!response.isBoom) {
                return reply.continue();
            }

            // log joi validation error
            if (response.data && response.data.isJoi) {
                log.fatal('Validation error', {
                    response: response,
                    requestData: request.orig,
                    path: request.path
                });
            }

            reply.continue();
        });

        // start the server
        server.start((err) => {

            if (err) {
                throw err;
            }
            console.log('Server running at:', server.info.uri);
        });

    })
    .catch(err => {
        throw err;
    });