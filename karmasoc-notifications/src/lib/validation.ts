'use strict';
const Joi = require('joi');

export const validations : any = {};

validations.mongoId = Joi.string().optional();
validations.mongoIdRequired = Joi.string().required();

validations.notify = Joi.object().keys({
    user_to: validations.mongoIdRequired,
    user_from: validations.mongoIdRequired,
    message: Joi.string().required()
}).required();

validations.notifyNewPostShare = Joi.object().keys({
    user_id: validations.mongoIdRequired,
    post_id: validations.mongoIdRequired,
    user_name: Joi.string().required()
}).required();

validations.notifyNewImpression = Joi.object().keys({
    user_id: validations.mongoIdRequired,
    post_id: validations.mongoIdRequired,
    user_name: Joi.string().required(),
    type: Joi.string().required().valid(['video', 'image', 'audio'])
}).required();

validations.notifyNewFollower = Joi.object().keys({
    user_id: validations.mongoIdRequired,
    follow_id: validations.mongoIdRequired
}).required();

validations.notifyNewPostFavorator = Joi.object().keys({
    favorator_id: validations.mongoIdRequired,
    post_id: Joi.string().required()
}).required();
