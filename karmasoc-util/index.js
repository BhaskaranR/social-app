'use strict';
const Hoek = require('hoek');
const ObjectID = require('bson-objectid');

const fns = {
    reporter: require('./lib/reporter'),
    slack: require('./lib/slack'),
    logger: require('./lib/logger')
};


fns.decorateNewDateData = function(target) {
    let isoDate = new Date().toISOString();
    return Hoek.merge(target, {
        create_date: isoDate,
        modified_date: isoDate
    });
};

fns.updateModifiedDate = function(target) {
    return Hoek.merge(target, {
        $currentDate: {
            modified_date: true
        }
    });
};

fns.safeObjectId = function(objectIdString, idType) {
    idType = idType || 'id';
    return new Promise((resolve) => {
        resolve(new ObjectID(objectIdString));
    }).catch(() => {
        throw new Error('Invalid ' + idType);
    });
};

module.exports = fns;