'use strict';

const bluebird = require('bluebird');

module.exports = {
    getUserByMail
};

function getUserByMail(userMail, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getUser',
        by: 'mail',
        data: {
            mail: userMail
        }
    }).then(unwrap);
}

function unwrap(response) {

    if (response.err) {
        throw response.err;
    }

    return response.data;
}

