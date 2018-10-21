'use strict';
import * as db from './database';
import * as Joi from 'joi';
import {validations} from './validation';

const util = require('./util');



export const deletePost = (requestData, done) => {
    db.deletePost(requestData.data.postId)
        .then(res => {
            console.log(res.result);
            done(res.result, {});
        })
        .catch(done);
};


export const toggleFavorPost = (requestData, next) => {
    Joi.validate(requestData.data, validations.favorPost, (err, validatedData) => {
        if (err) {
            return next(err);
        }
        var favorData = {
            userId: requestData.data.userId,
            like: requestData.data.like
        };
        return db.hasUserPostFavored(validatedData.postId, validatedData.userId)
            .then(hasFavored => {
                return db.updateFavor(validatedData.postId, favorData, "update")
                    .then(res => {
                        return {
                            //  favorites: res.value.favorites.length,
                            added: false,
                            removed: false,
                            updated: true
                        };
                    });
            })
            .then(res => next(null, res))
            .catch(next);
    });
};

export const favorPost = (requestData, next) => {
    Joi.validate(requestData.data, validations.favorPost, (err, validatedData) => {
        if (err) {
            return next(err);
        }
        var favorData = {
            userId: requestData.data.userId,
            like: requestData.data.like
        };
        //work around for now..
        db.updateFavor(requestData.data.postId, favorData, "remove").then(() => {
                return db.updateFavor(requestData.data.postId, favorData, "add")
                    .then(res => {
                        return {
                            //favorites: res.value.likes.length + 1,
                            added: true,
                            updated: false,
                            removed: false
                        };
                    })
                    .then(res => next(null, res))
                    .catch(next);
            })
            .catch(next);
    });
};

export const unfavorPost = (requestData, next) => {
    Joi.validate(requestData.data, validations.favorPost, (err, validatedData) => {
        if (err) {
            return next(err);
        }
        var favorData = {
            userId: requestData.data.userId,
            like: requestData.data.like
        };
        return db.updateFavor(requestData.data.postId, favorData, "remove")
            .then(res => {
                return {
                    favorites: res.value.likes.length - 1,
                    added: false,
                    update: false,
                    removed: true
                };
            })
            .then(res => next(null, res))
            .catch(next);
    });
};


export const addTextImpression = (requestData, next) => {
    let data = requestData.data;
    let impressionObject = {
        userId: data.userId,
        postId: data.postId,
        text: data.text,
        type: 'text'
    };

    return db.genericById(data.postId, 'posts')
        .then(result => {
            if (!result) {
                throw Error('Invalid id');
            }
        })
        .then(() => {
            db.genericInsertOne(impressionObject, 'impressions')
        }).then(() => {
            next(null, { data: impressionObject });
        })
        .catch(err => {
            util.serviceError(err, 'new post impression create service', next);
        });
};

export const addImageImpression = (requestData, next) => {
    this.genericAddImpression(requestData, 'image', next);
};

export const addVideoImpression = (requestData, next) => {
    this.genericAddImpression(requestData, 'video', next);
};

export const addAudioImpression = (requestData, next) => {
    this.genericAddImpression(requestData, 'audio', next);
};

export const deleteImpression = (requestData, done) => {
    db.deleteImpression(requestData.data.impressionId)
        .then(res => {
            console.log(res.result);
            done(res.result, {});
        })
        .catch(done);
};

export const genericAddImpression = (requestData, type, next) => {
    Joi.validate(requestData.data, validations.impression, (err, data) => {
        let impressionObject = {
            userId: data.userId,
            postId: data.postId,
            data: '/api/v2/posts/impression/' + type + '/' + data.file.id + '/' + data.file.name,
            type: type,
            file_id: data.file.id
        };

        return db.genericById(data.postId, 'posts')
            .then(() => db.genericInsertOne(impressionObject, 'impressions'))
            // TODO add response if res.ops[0] does not exist
            .then(res => res.ops && res.ops.length ? res.ops[0] : {})
            .then(res => next(null, { data: res }))
            .catch(err => {
                if (err.message === 'not found') {
                    return next(null, { err: { msg: 'NOT_FOUND', detail: 'Post not found' } });
                }
                if (err.message === 'Invalid id') {
                    return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid post id' } });
                }
                return util.serviceError(err, 'Service: add impression of type ' + type, next);
            });
    });
};

/*

fns.getPostOfUser = (requestData, done) => {
    Joi.validate(requestData.data, validations.postOfUser, (err, validatedData) => {
        if (err) {
            return done(err);
        }

        db.getPostOfUser(validatedData.userId, 'posts')
            .then(res => done(null, { data: res }))
            .catch(done);
    });
};
*/


export const getImpressionsByPostId = (requestData, next) => {
    let data = requestData.data;
    db.getImpressionsByPostId(requestData.data.obj)
        .then(res => next(null, res))
        .catch(next);
};

export const getPostsOfUser = (requestData, done) => {
    Joi.validate(requestData.data, validations.postOfUser, (err, validatedData) => {
        if (err) {
            return done(err);
        }
        db.getPostsOfUser(validatedData.userId, 'posts')
            .then(res => done(null, { data: res }))
            .catch(done);
    });
};

export const getCountForPostsByUserId = (requestData, done) => {
    db.getCountForPostsByUserId(requestData.data.user_id)
        .then(count => done(null, { count: count }))
        .catch(done);
};


export const getSettings = (message, next) => {
    Joi.validate(message.data, validations.getSettings, (err, data) => {
        if (err) {
            return util.validationError(err, 'get settings by post id service ', next);
        }
        let userId = message.requesting_user_id;
        db.getSettings(data.postId, userId)
            .then(settings =>
                next(null, { data: settings }))
            .catch(err =>
                util.serviceError(err, 'get post settings', next));
    });
};


export const updateSettings = (message, next) => {
    Joi.validate(message.data, validations.updateSettings, (err, data) => {

        if (err) {
            return util.validationError(err, 'update settings by post id service ', next);
        }
        let userId = "";
        db.updateSettings(data.postId, userId, data.settings)
            .then(next(null, { data: { ok: 'true' } }))
            .catch(err => util.serviceError(err, 'update post settings', next));
    });
}

export const getPostsById = (message, next) => {
    db.getPostsById(message.data)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get Post by id', next));
};

export const getPostByPostId = (message, next) => {
    db.getPostByPostId(message.data)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get Post by post id', next));
};

export const getAllPostByPostId = (message, next) => {
    db.getAllPostByPostId(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};

export const getAllImpressionsForPostIds = (message, next) => {
    db.getAllImpressionsForPostIds(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get impressions for post id', next));
};

export const getAllPostByUserId = (message, next) => {
    db.getAllPostByUserId(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};

export const getProfilePostByUserId = (message, next) => {
    db.getProfilePostByUserId(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};

export const getGalleryPostByUserId = (message, next) => {
    db.getGalleryPostByUserId(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};



export const getPostByUserIdandPostType = (message, next) => {
    db.getPostByUserIdandPostType(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};


export const getFunPostByUserId = (message, next) => {
    db.getFunPostByUserId(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};

export const getLearnPostByUserId = (message, next) => {
    db.getLearnPostByUserId(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};


export const getMyPagePostByUserId = (message, next) => {
    db.getMyPagePostByUserId(message.data.obj)
            .then((result) => {
                next(null, { data: result })
            })
            .catch(err => util.serviceError(err, 'Get all Post by post id', next));
};