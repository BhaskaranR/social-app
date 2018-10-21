
import * as boom from 'boom';
import { runQuery } from 'apollo-server-core';
import { addResolveFunctionsToSchema, makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { createLoaders } from '../database';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
const path = require('path')
const mergeGraphqlSchemas = require('merge-graphql-schemas')
const fileLoader = mergeGraphqlSchemas.fileLoader;
const mergeTypes = mergeGraphqlSchemas.mergeTypes;
const mergeResolvers = mergeGraphqlSchemas.mergeResolvers;
import { PubSub } from 'graphql-subscriptions';
import { graphiqlHapi } from 'apollo-server-hapi';


const util = require('../util/util');
const utilities = require('karmasoc-util');
const log = utilities.logger;
const slack = utilities.slack;
const helper = require('../util/responseHelper');
const basicPin = {
    role: 'graphql-local'
};

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, '../schemas'), { recursive: true }))
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, '../resolvers'), { extensions: ['.ts'] }));


const WS_GQL_PATH = '/subscriptions';

export const pubsub = new PubSub();
export const CHAT_MESSAGE_SUBSCRIPTION_TOPIC = 'CHAT_MESSAGE_ADDED';


export function setupGraphql(server) {

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const optionsObject = {
        schema: schema,
        context: {
            loaders: createLoaders(),
            basicSenecaPattern: null
        },
        debug: true
    };

    new SubscriptionServer(
        {
            schema,
            execute,
            subscribe,
        },
        {
            path: WS_GQL_PATH,
            server,
        }
    );






    const graphqlQuery = {
        method: 'POST',
        path: '/graphql',
        handler: (request, reply) => {
            log.info("Incoming GraphQl request");
            let context: any = optionsObject.context;
            context.requesting_user_id = request.basicSenecaPattern.requesting_user_id !== 'unknown' ?
                request.basicSenecaPattern.requesting_user_id : 'null';
            context.requesting_device_id = request.basicSenecaPattern.requesting_device_id;
            const apolloOptions: any = optionsObject;
            let params = {
                schema: apolloOptions.schema,
                query: request.payload.query,
                variables: typeof request.payload.variables === 'string' ?
                    JSON.parse(request.payload.variables) : request.payload.variables,
                context: context,
                rootValue: apolloOptions.rootValue,
                operationName: request.payload.operationName,
                logFunction: apolloOptions.logFunction,
                validationRules: apolloOptions.validationRules,
                formatResponse: apolloOptions.formatResponse,
                debug: optionsObject.debug
            };

            runQuery(params)
                .then((resp) => {
                    reply(resp);
                }).catch((e) => {
                    log.error(e);
                    reply(boom.badImplementation(e.message));
                });
        },
        config: {
            description: 'queries feeds',
            notes: 'TODO',
            tags: ['api', 'feeds', 'query'],
            auth: false,
        }
    };

    server.register({
        register: graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql'
            },
            auth: false
        },
    });

    server.route([graphqlQuery]);

}