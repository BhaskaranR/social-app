import * as Hapi from 'hapi';
import * as Seneca from 'seneca';
import * as util from './util/util';
import UserController from './controllers/userController';
import { validate } from './setup/redis';
import { setupGraphql } from './setup/graphql';

const Bluebird = require('bluebird');
const Glue = require('glue');
const log = require('karmasoc-util').logger;
const server = new Hapi.Server();
var url = require('url');   // node core!

var config = require('config');

//initialize redis
var redisClient = require('./session/session')(); // instantiate redis-connection
redisClient.set('redis', 'bulljit');
redisClient.get('redis', function (rediserror, reply) {
    if (rediserror) {
        console.log(rediserror);
    }
});


// Locator API
const user = require('./routes/user');
const device = require('./routes/device');
const posts = require('./routes/posts');
const video = require('./routes/video');
const messenger = require('./routes/messenger');
const business = require('./routes/business');
const image = require('./routes/image');
const recommendations = require('./routes/recommendations');
const search = require('./routes/search');
// declare  plugins
export let manifest = {
    registrations: [
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
        /*{
            plugin: {
                register: 'hapi-auth-google',
                options: {
                    REDIRECT_URL: '/googleauth', // must match google app redirect URI from step 2.8
                    handler: UserController.googlelogin, // your handler
                    scope: 'https://www.googleapis.com/auth/plus.profile.emails.read'
                }
            }
        } */
    ]
};

manifest["connections"] = [{
    port: config.get("env.port.karmasoc-web-server") || '8200',
    routes: {
        cors: {
            origin: ['*'],
            credentials: true,
            exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'authorization']
        }
    }

}];
export var pact;

Glue.compose(manifest, { relativeTo: __dirname }, (err, server) => {
    if (err) {
        throw err;
    }
    // configure auth strategy
    server.auth.strategy('jwt', 'jwt', true,
        {
            key: config.get("jwtSecret"),
            validateFunc: validate,
            verifyOptions: { ignoreExpiration: true }
        });
    // configure device cookie
    server.state('karmasoc', {
        ttl: 24 * 60 * 60 * 1000 * 365,   // 1 year
        isSecure: false,
        path: '/',
        encoding: 'base64json'
        // TODO: set password and inspect API
    });
    // decorate request object with user id and device id
    server.ext('onPostAuth', (request, reply) => {
        request.basicSenecaPattern = {
            requesting_session_id: util.getSessionId(request.auth),
            requesting_user_id: util.getUserId(request.auth),
            requesting_device_id: util.getDeviceId(request.state),
            cmd: ''
        };
        reply.continue();
    });
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
        if (response.output.statusCode === 400) {

            log.fatal('Client error', {
                response: response,
                requestData: request.orig,
                path: request.path
            });
        }
        reply.continue();
    });
    log.info("adding routes");

    server.route(user.routes);
    server.route(device.routes);
    server.route(posts.routes);
    server.route(video.routes);
    server.route(messenger.routes);
    server.route(business.routes);
    server.route(recommendations.routes);
    server.route(search.routes);
    server.route(image.routes);
    const seneca = server.seneca;
    pact = Bluebird.promisify(seneca.act, { context: seneca });
    server.decorate('server', 'pact', pact);

    const amqpUrl = config.get("rabbitmqCloudUrl");
    seneca.use('seneca-amqp-transport')
        .client({
            type: 'amqp',
            url: amqpUrl,
            pin: 'role:user'
        })
        .client({
            type: 'amqp',
            url: amqpUrl,
            pin: 'role:mailer'
        })
        .client({
            type: 'amqp',
            url: amqpUrl,
            pin: 'role:mailer'
        })
        .client({
            type: 'amqp',
            url: amqpUrl,
            pin: 'role:posts'
        })
        .client({
            type: 'amqp',
            url: amqpUrl,
            pin: 'role:business'
        })
        .client({
            type: 'amqp',
            url: amqpUrl,
            pin: 'role:notifications'
        });

     setupGraphql(server);

    server.start(err => {
        if (err) {
            throw err;
        }

        log.info('Server running at:', server.info.uri);
    });
});