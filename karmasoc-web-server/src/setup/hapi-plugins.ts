/*import UserController from '../controllers/userController';
import { Request, Server } from 'hapi';
import { graphqlHapi, graphiqlHapi } from 'apollo-server-hapi';
import { optionsObject } from './graphql-setup';

let config = require('config');
var utilities = require('karmasoc-util');
var log = utilities.logger;

// Hapi interface
export const server = new Server();


export const manifest = {
    connections: [{
        port: config.get("env.port.karmasoc-web-server") || '8200',
        routes: {
            cors: {
                origin: ['*'],
                credentials: true,
                exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'authorization']
            }
        },
    }],
    registrations: [
        { plugin: { register: 'hapi-cors', options: { origins: ['*'] } } },
        { plugin: { register: 'chairo' } },
        { plugin: { register: 'inert' } },
        { plugin: { register: 'vision' } },
        { plugin: { register: 'hapi-swagger' } },
        { plugin: { register: 'hapi-auth-jwt2' } },
        { plugin: { register: 'h2o2' } },
        {
            plugin: {
                register: 'good',
                options: {
                    requestPayload: true,
                    reporters: [{
                        reporter: require('good-console'),
                        events: { log: '*', response: '*', request: '*' }
                    }, {
                        reporter: require('good-bunyan'),
                        config: {
                            logger: require('bunyan')
                                .createLogger({
                                    name: 'karmasoc',
                                    streams: [{
                                        type: 'rotating-file',
                                        path: config.get("env.log.pathFileLogFile"),
                                        period: '1d',   // daily rotation
                                        count: 14        // keep 14 back copies
                                    }]
                                })
                                .child({ service: 'karmasoc-web-server' }),
                            levels: {
                                log: 'info',
                                response: 'info',
                                request: 'info'
                            }
                        },
                        events: { log: '*', response: '*', request: '*' }
                    }]
                }
            }
        } //,
    ]
};

*/