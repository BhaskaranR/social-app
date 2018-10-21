'use strict';

import * as Hoek from 'hoek';
var ObjectID = require('mongodb').ObjectID;
var util = require('karmasoc-util');
var log = util.logger;


export const validationError = (err, service, next) => {
    log.error(err, 'Validation failed of' + service);
    return next(err);
};

export const serviceError = (err, service, next) => {
    log.error(err, service + ' failed');
    return next(err);
};

export const decorateNewDateData = (target) => {
    let isoDate = new Date().toISOString();
    return Hoek.merge(target, {
        create_date: isoDate,
        modified_date: isoDate
    });
};

export const updateModifiedDate = (target) => {
    return Hoek.merge(target, {
        $currentDate: {
            modified_date: true
        }
    });
};

export const safeObjectId = (objectIdString, idType? : any) => {
    idType = idType || 'id';
    return new Promise((resolve, reject) => {
        resolve(new ObjectID(objectIdString));
    }).catch(() => {
        throw new Error('Invalid ' + idType);
    });
};