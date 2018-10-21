import { ApolloOptions } from 'apollo-server';
import { runQuery } from 'apollo-server';

var utilities = require('karmasoc-util');
var log = utilities.logger;

export function apolloSeneca(optionsObject: ApolloOptions) {

    return (msg: any, respond: (error: Error, msg: any) => void) => {
        try {
            log.info("Incoming GraphQl request")
            let context = optionsObject.context;
            context.requesting_user_id = msg.requesting_user_id != 'unknown' ?
                msg.requesting_user_id : '57afd9d64e35a7000526b63b';
            context.requesting_device_id = msg.requesting_device_id;
            let params = {
                schema: optionsObject.schema,
                query: msg.data.payload.query,
                variables: typeof msg.data.payload.variables === 'string' ?
                    JSON.parse(msg.data.payload.variables) : msg.data.payload.variables,
                context: context,
                rootValue: optionsObject.rootValue,
                operationName: msg.data.payload.operationName,
                logFunction: optionsObject.logFunction,
                validationRules: optionsObject.validationRules,
                formatResponse: optionsObject.formatResponse,
                debug: optionsObject.debug
            };

            runQuery(params)
                .then((resp) => {
                    respond(null, { data: resp });
                }).catch((e) => {
                    log.error(e);
                    respond(null, { data: { errors: { message: e.message } } });
                })
        }
        catch (e) {
            log.error(e);
            respond(null, { data: { errors: { message: e.message } } });
        }
    }
}