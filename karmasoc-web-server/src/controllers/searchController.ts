'use strict';
import * as boom from 'boom';


const searchutil = require('../util/util');

let searchHandler :any = {};
const searchbasicPin = {
    role: 'search'
};


searchHandler.search = (request, reply) => {
    let userId = request.params.userId;
    request.basicSenecaPattern.cmd = 'search';
    request.query = request.query.q;
    let senecaAct = searchutil.setupSenecaPattern(request.basicSenecaPattern, {}, basicPin);
    request.server.pact(senecaAct)
        .then((resp) => reply(resp))
        .catch(error => {
            if (error) {
                reply({ items: [] });
            }
        });
};

searchHandler.suggest = (request, reply) => {
    let userId = request.params.userId;
    request.basicSenecaPattern.cmd = 'suggest';
    request.query = request.query.q;

    let senecaAct = searchutil.setupSenecaPattern(request.basicSenecaPattern, {}, basicPin);
    request.server.pact(senecaAct)
        .then((resp) => reply(resp))
        .catch(error => {
            if (error) {
                reply({ items: [] });
            }
        });
};


module.exports = searchHandler;