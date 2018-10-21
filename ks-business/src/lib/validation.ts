'use strict';

import * as Joi from 'joi';

export const validation: any = {};

validation.mongoId = Joi.string().optional();
validation.mongoIdRequired = Joi.string().required();

let basicDataWithBizData = Joi.object().keys({
    biz_id: validation.mongoIdRequired
});

validation.favorBiz = basicDataWithBizData.keys({
    biz_id: validation.mongoIdRequired
});


const locationsSchema = Joi.object({
    long: Joi.number().required(),
    lat: Joi.number().required(),
    title: Joi.string().required(),
    place: Joi.string().required(),
}).required();

const arraySchema = Joi.array().items(locationsSchema).min(1).unique()
    .required();


validation.geobiz = Joi.object({
    referredBy: Joi.string().optional().allow([null, ""]),
    bizid: Joi.string().required(),
    categoryId: Joi.string().required().description('Category'),
    subcategoryId: Joi.string().optional().allow([null, ""]),
    title: Joi.string().required(),
    website: Joi.string().optional().allow([null, ""]),
    geotag: Joi.string().optional().allow([null, ""]),
    locations: Joi.alternatives().try(locationsSchema, arraySchema).required(),
    userid: Joi.string().optional()
});

validation.geobizNearby = Joi.object({
    long: Joi.number().required(),
    lat: Joi.number().required(),
    maxDistance: Joi.number().default(10),
    limit: Joi.number()
});

validation.getBizById = Joi.object({
    bizId: validation.mongoIdRequired
});

validation.impression = Joi.object({
    user_id: validation.mongoIdRequired,
    biz_id: validation.mongoIdRequired,
    file: Joi.object().keys({
        id: validation.mongoIdRequired,
        name: Joi.string().required()
    })
});

validation.bizByName = Joi.object({
    bizName: Joi.string().required()
});

validation.bizOfUser = Joi.object({
    user_id: validation.mongoIdRequired
});

validation.addImage = Joi.object().keys({
    biz_id: Joi.string().required(),
    images: Joi.object().keys({
        small: Joi.string().required(),
        normal: Joi.string().required()
    }).required()
});

validation.addBgImage = Joi.object().keys({
    biz_id: Joi.string().required(),
    bgimages: Joi.object().keys({
        small: Joi.string().required(),
        normal: Joi.string().required()
    }).required()
});

validation.follow = basicDataWithBizData.keys({
    biz_id: validation.mongoIdRequired,
    user_id: validation.mongoIdRequired
});


validation.getFollowing = basicDataWithBizData;

validation.getBiz = basicDataWithBizData;
