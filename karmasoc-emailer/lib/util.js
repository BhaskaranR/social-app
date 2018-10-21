'use strict';

const log = require('karmasoc-util').logger;

module.exports = {
    validationError,
    serviceError
};

function validationError(err, service, next) {
    log.error(err, 'Validation failed of' + service);
    return next(err);
}

function serviceError(err, service, next) {
    log.error(err, service + ' failed');
    return next(err);
}