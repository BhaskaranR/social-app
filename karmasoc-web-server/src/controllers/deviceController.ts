'use strict';
const boom = require('boom');
import * as util from '../util/util'
import { unwrap } from '../util/responseHelper';

let handler = {};
const basicPin = {
    role: 'user'
};

export default class DeviceController {
    static ping = (request, reply) => {
        // setup pattern
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'ping';

        let pingPayload = request.payload;


        let senecaAct = util.setupSenecaPattern(pattern, pingPayload, basicPin);

        // call microservice with pattern
        request.server.pact(senecaAct)
            .then(unwrap)
            .then(result => {
                return reply(result);
            })
            .catch(error => reply(boom.badImplementation(error)));

    }

    static register = (request, reply) => {
        // setup pattern
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'register';
        pattern.entity = 'device';

        let device = request.payload;

        device.user_id = request.basicSenecaPattern.requesting_user_id;

        let senecaAct = util.setupSenecaPattern(pattern, device, basicPin);

        // call microservice with pattern
        request.server.pact(senecaAct)
            .then(unwrap)
            .then(result => {
                return reply({ message: 'device registered, karmasoc-cookie was set' })
                    .state('karmasoc', { device_id: result.deviceId }).code(201);
            })
            .catch(error => reply(boom.badImplementation(error)));
    }

    static unregister = (request, reply) => {
        // set device to inactive
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'unregister';
        pattern.entity = 'device';

        let device = request.payload;
        device.user_id = request.basicSenecaPattern.requesting_user_id;
        let senecaAct = util.setupSenecaPattern(pattern, device, basicPin);
        request.server.pact(senecaAct)
            .then((unwrap))
            .then(resulg => {
                return reply({message: 'device unregistered'})
            })
            .catch(error => reply(boom.badImplementation(error)));
    }
}
