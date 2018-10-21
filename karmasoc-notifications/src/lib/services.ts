'use strict';

const bluebird = require('bluebird');


export function getUserById(userId, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getUser',
        by: 'id',
        data: {
            user_id: userId
        }
    }).then(unwrap);
}

export function getFollowersByUserId(userId, seneca) {

    let act = bluebird.promisify(seneca.act, {context: seneca});
    return act({
        role: 'user',
        cmd: 'getfollowers',
        data: {
            user_id: userId
        }
    }).then(unwrap);
}

export function getDevices(ids, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});

    if (ids.length === 0) {
        return [];
    }
    
    return act({
        role: 'user',
        cmd: 'get',
        entity: 'pushToken',
        data: {
            user_ids: ids
        }
    }).then(unwrap);

}



export function getPostById(id, seneca) {
    let act = bluebird.promisify(seneca.act, {context: seneca});

    return act({
        role: 'post',
        cmd: 'postById',
        data: {
            postId: id
        }
    }).then(unwrap);
}

export function unwrap(response) {

    if (response.err) {
        throw response.err;
    }

    return response.data;
}
