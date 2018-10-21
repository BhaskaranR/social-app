'use strict';
const Joi = require('joi');
let validations: any = {};


validations.postId = Joi.object().keys({
    postId: Joi.string().required()
});

validations.favor = Joi.object().keys({
    favor: Joi.string().valid(
        'love',
        'like',
        'dislike',
        'smile',
        'happy',
        'sad',
        'very sad')
});

validations.textImpression = Joi.object().keys({
    text: Joi.string().min(0).required()
});

validations.deletePost = Joi.object().keys({
    postId: Joi.string().required()
});
validations.videoImpressionId = Joi.object().keys({
    videoId: Joi.string().required()
});

validations.imageImpressionId = Joi.object().keys({
    imageId: Joi.string().required()
});

validations.settings = Joi.object().keys({
    settings: Joi.object().required()
});

validations.geotag = Joi.object().keys({
    coordinates: Joi.object().keys({
        lat: Joi.number(),
        long: Joi.number()
    }),
    type: Joi.valid('Point')
}),

    validations.post = Joi.alternatives().try(
        Joi.object().keys({
            clientId: Joi.string(),
            bizId: Joi.string().allow('').optional(),
            bookmarks: Joi.array().allow(null).items(Joi.string().valid('mypage', 'fun', 'learn')).max(3).optional(),
            access: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
            likes: Joi.array().allow(null).optional(),
            favorites: Joi.array().allow(null).optional(),
            text: Joi.string(),
            mentions: Joi.array().items().allow(null),
            geotag: Joi.object().allow(null).optional()
        }),
        Joi.object().keys({
            clientId: Joi.string(),
            bizId: Joi.string().allow('').optional(),
            bookmarks: Joi.array().allow(null).items(Joi.string().valid('mypage', 'fun', 'learn')).max(3).optional(),
            access: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
            likes: Joi.array().allow(null).optional(),
            favorites: Joi.array().allow(null).optional(),
            text: Joi.string().allow(''),
            mentions: Joi.array().items().min(1),
            geotag: Joi.object().allow(null).optional()
        }),
        Joi.object().keys({
            clientId: Joi.string(),
            bizId: Joi.string().allow('').optional(),
            bookmarks: Joi.array().allow(null).items(Joi.string().valid('mypage', 'fun', 'learn')).max(3).optional(),
            access: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
            likes: Joi.array().allow(null).optional(),
            favorites: Joi.array().allow(null).optional(),
            text: Joi.string().allow(''),
            mentions: Joi.array().items().allow(null),
            geotag: validations.geotag
        })
    );


validations.postOthers = Joi.alternatives({
    clientId: Joi.string(),
    bizId: Joi.string().allow('').optional(),
    bookmarks: Joi.array().allow(null).items(Joi.string().valid('mypage', 'fun', 'learn')).max(3).optional(),
    access: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
    likes: Joi.array().allow(null).optional(),
    favorites: Joi.array().allow(null).optional(),
});

// validations.post = validations.posttype.concat(validations.postOthers);

module.exports = validations;