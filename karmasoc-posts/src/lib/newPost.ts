'use strict';

import * as db from './database';
import * as Joi from 'joi';
const util = require('./util');

const validation: any = {};


validation.mongoId = Joi.string().optional();
validation.mongoIdRequired = Joi.string().required();

validation.geotag = Joi.object().keys({
    coordinates: Joi.object().keys({
        lat: Joi.number(),
        long: Joi.number()
    }),
    type: Joi.string().valid('Point')
}),

    validation.post = Joi.alternatives().try(
        Joi.object().keys({
            userId: validation.mongoIdRequired,
            postType: Joi.string().required(),
            clientId: Joi.string(),
            bizId: Joi.string().allow('').optional(),
            bookmarks: Joi.array().allow(null).items(Joi.string().valid('mypage', 'fun', 'learn')).max(3).optional(),
            access: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
            likes: Joi.array().allow(null).optional(),
            favorites: Joi.array().allow(null).optional(),
            text: Joi.string(),
            withFriends: Joi.array().items(Joi.string()).default([]),
            mentions: Joi.array().items().allow(null),
            shares: Joi.array(),
            geotag: Joi.object().allow(null).optional(),
            photos: Joi.array().items(Joi.object().keys({
                key: Joi.string().required(),
                xlarge: Joi.string().required(),
                large: Joi.string().required(),
                normal: Joi.string().required(),
                small: Joi.string().required(),
                ext: Joi.string().required()
            })).optional(),
            fileUrl: Joi.array().items(Joi.object().keys({
                id: validation.mongoIdRequired,
                ext: Joi.string().required(),
                name: Joi.string().required()
            })).optional()
        }),
        Joi.object().keys({
            userId: validation.mongoIdRequired,
            postType: Joi.string().required(),
            clientId: Joi.string(),
            bizId: Joi.string().allow('').optional(),
            bookmarks: Joi.array().allow(null).items(Joi.string().valid('mypage', 'fun', 'learn')).max(3).optional(),
            access: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
            likes: Joi.array().allow(null).optional(),
            favorites: Joi.array().allow(null).optional(),
            text: Joi.string().allow(''),
            withFriends: Joi.array().items(Joi.string()).default([]),
            mentions: Joi.array().items().min(1),
            shares: Joi.array(),
            geotag: Joi.object().allow(null).optional(),
            photos: Joi.array().items(Joi.object().keys({
                key: Joi.string().required(),
                xlarge: Joi.string().required(),
                large: Joi.string().required(),
                normal: Joi.string().required(),
                small: Joi.string().required(),
                ext: Joi.string().required()
            })).optional(),
            fileUrl: Joi.array().items(Joi.object().keys({
                id: validation.mongoIdRequired,
                ext: Joi.string().required(),
                name: Joi.string().required()
            })).optional()
        }),
        Joi.object().keys({
            userId: validation.mongoIdRequired,
            postType: Joi.string().required(),
            clientId: Joi.string(),
            bizId: Joi.string().allow('').optional(),
            bookmarks: Joi.array().allow(null).items(Joi.string().valid('mypage', 'fun', 'learn')).max(3).optional(),
            access: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
            likes: Joi.array().allow(null).optional(),
            favorites: Joi.array().allow(null).optional(),
            text: Joi.string().allow(''),
            withFriends: Joi.array().items(Joi.string()).default([]),
            mentions: Joi.array().items().allow(null),
            shares: Joi.array(),
            geotag: validation.geotag,
            photos: Joi.array().items(Joi.object().keys({
                key: Joi.string().required(),
                xlarge: Joi.string().required(),
                large: Joi.string().required(),
                normal: Joi.string().required(),
                small: Joi.string().required(),
                ext: Joi.string().required()
            })).optional(),
            fileUrl: Joi.array().items(Joi.object().keys({
                id: validation.mongoIdRequired,
                ext: Joi.string().required(),
                name: Joi.string().required()
            })).optional()
        })
    );



export const newPost = (requestData, done) => {
    Joi.validate(requestData.data, validation.post, (err, requestData) => {
        if (err) {
            return util.validationError(err, 'new post create service', done);
        }
        this.addPost(requestData, done);
    });
};

export const addPost = (requestData, done) => {
    let post = util.decorateNewDateData(requestData);
    db.addNewPost(post)
        .then(() => {
            console.log('test');
            requestData._id = post._id;
            done(null, { data: post });
        })
        .catch(err => {
            util.serviceError(err, 'new post create service', done);
        });
};