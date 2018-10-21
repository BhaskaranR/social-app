'use strict';
import * as Joi from 'joi';

export const validations: any = {};

validations.mongoId = Joi.string().optional();
validations.mongoIdRequired = Joi.string().required();

let basicDataWithUserData = Joi.object().keys({
    userId: validations.mongoIdRequired
});

validations.favorPost = basicDataWithUserData.keys({
    postId: validations.mongoIdRequired,
    like: Joi.string().valid(
        'love',
        'like',
        'dislike',
        'smile',
        'happy',
        'sad',
        'very sad')
});

validations.impression = Joi.object({
    userId: validations.mongoIdRequired,
    postId: validations.mongoIdRequired,
    file: Joi.object().keys({
        id: validations.mongoIdRequired,
        name: Joi.string().required()
    })
});

validations.postOfUser = Joi.object({
    userId: validations.mongoIdRequired
});


validations.getSettings = Joi.object().keys({
    postId: validations.mongoIdRequired
});

validations.updateSettings = Joi.object().keys({
    postId: validations.mongoIdRequired,
    settings: Joi.object().required()
});
