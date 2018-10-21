'use strict';
import * as Joi from 'joi';
let reportValidations :any = {};

reportValidations.userId = {
    userId: Joi.string().required()
};

module.exports = reportValidations;