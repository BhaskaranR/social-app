'use strict';

const ObjectID = require('mongodb').ObjectID;

const fns = {};

fns.safeObjectId = (objectIdString, idType) => {

    idType = idType || 'id';

    return new Promise((resolve) => {
        resolve(new ObjectID(objectIdString));

    }).catch(() => {
        throw new Error('Invalid ' + idType);
    });
};

fns.noop = () => {
    console.log('info: no implementation found');
};

module.exports = fns;
