'use strict';
import * as boom from 'boom';

const recutil = require('../util/util');


let rechandler :any = {};
const recbasicPin = {
    role: 'recommendations'
};


rechandler.getRecByUserId = (request, reply) => {
    let userId = request.params.userId;
    request.basicSenecaPattern.cmd = 'recommendationForPerson';

    let senecaAct = recutil.setupSenecaPattern(request.basicSenecaPattern, {
        user_id: userId,
        namespace: 'business',
        actions: {
            view: 1,
            likes: 2,
            addimpression: 1
        }

    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'not found') {
                return reply(boom.notFound(error.details.message));
            }
            console.log(JSON.stringify(error));
            return reply(boom.badRequest(error.details.message));

        });
};


module.exports = rechandler;