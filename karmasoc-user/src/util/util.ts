/// <reference path="../../typings.d.ts" />
'use strict';

const util = require('karmasoc-util');
const log = util.logger;

export default class Util{
    public static  validationError = (err, service, next) => {
        log.error(err, 'Validation failed of' + service);
        return next(err);
    }

    public static serviceError = (err, service, next) => {
        log.error(err, service + ' failed');
        return next(err);
    }
}
