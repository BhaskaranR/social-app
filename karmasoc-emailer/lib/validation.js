'use strict';

const Joi = require('joi');

const validations = {};

validations.mongoId = Joi.string().optional();
validations.mongoIdRequired = Joi.string().required();

let basicDataWithUserData = Joi.object().keys({
    user_id: validations.mongoIdRequired
});

validations.passwordForgotten = Joi.object().keys({
    mail: Joi.string().email().min(3).max(60).required()
        .description('Mail address'),
    new_password: validations.mongoIdRequired
});


validations.confirmMail = Joi.object().keys({
    userid: Joi.string().email().min(3).max(60).required().description('Mail address'),
    token: Joi.string().required(),
    name: Joi.string().required()
});



validations.mailAndName = Joi.object().keys({
    mail: Joi.string().email().min(3).max(60).required()
        .description('Mail address'),
    name: Joi.string().required()
});


module.exports = validations;