'use strict';
import * as db from './database';
import {validation} from './validation';
import * as util from './util';
import * as Joi from 'joi';
const ksocutil = require('karmasoc-util')


export const getBizById = (requestData, next) => {
    Joi.validate(requestData.data, validation.getBizById, (err, data) => {
        if (err) {
            return util.validationError(err, 'business get service', next);
        }
        db.genericById(data.bizId, 'business')
            .then(business => next(null, { data: business }))
            .catch(err => {
                if (err.message === 'not found') {
                    return next(null, { err: { msg: 'NOT_FOUND', detail: 'Business not found' } });
                }
                if (err.message === 'Invalid id') {
                    return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid business id' } });
                }
                util.serviceError(err, 'business get service', next);
            });
    });
};

export const toggleFavorBiz = (requestData, next) => {
    Joi.validate(requestData.data, validation.favorBiz, (err, validatedData) => {
        if (err) {
            return next(err);
        }
        return db.hasUserBizFavored(validatedData.biz_id, validatedData.user_id)
            .then(hasFavored => {
                return db.updateFavor(validatedData.biz_id, validatedData.user_id, hasFavored)
                    .then(res => {
                        let ofc = res.value.favorites.length;
                        let nfc = hasFavored ? ofc - 1 : ofc + 1;
                        return {
                            favorites: nfc,
                            added: !hasFavored,
                            removed: hasFavored
                        };
                    });
            })
            .then(res => next(null, res))
            .catch(next);

    });
};

export const addImageToBiz = (message, next) => {
    Joi.validate(message.data, validation.addImage, (err, data) => {
        if (err) {
            return util.validationError(err, 'add image to biz service', next);
        }
        db.addImageToBiz(data.biz_id, data.images)
            .then(user => next(null, { data: user.value }))
            .catch(err => util.serviceError(err, 'Add image to biz service', next));
    });

};

export const addBgImageToBiz = (message, next) => {
    Joi.validate(message.data, validation.addBgImage, (err, data) => {
        if (err) {
            return util.validationError(err, 'add bd image to user service', next);
        }
        db.addBgImageToBiz(data.biz_id, data.bgimages)
            .then(user => {
                return next(null, { data: user.value })
            })
            .catch(err => util.serviceError(err, 'Add image to user service', next));
    });

};

export const favorBiz = (requestData, next) => {
    return db.updateFavor(requestData.data.biz_id, requestData.data.user_id, false)
        .then(res => {
            return {
                favorites: res.value.length + 1,
                added: true,
                removed: false
            };
        })
        .then(res => next(null, res))
        .catch(next);
};

export const unfavorBiz = (requestData, next) => {
    return db.updateFavor(requestData.data.biz_id, requestData.data.user_id, true)
        .then(res => {
            return {
                favorites: res.value.length - 1,
                added: false,
                removed: true
            };
        })
        .then(res => next(null, res))
        .catch(next);
};

export const follow = (message, next) => {
    Joi.validate(message.data, validation.follow, (err, validatedData) => {
        if (err) {
            return util.validationError(err, 'business follow service', next);
        }
        // don't follow yourself
        if (validatedData.biz_id === validatedData.user_id) {
            return next(null, { err: { msg: 'SELF_FOLLOW', detail: 'Can\'t follow yourself' } });
        }
        db.updateFollow(validatedData.biz_id, validatedData.user_id, false)
            .then(biz => next(null, { data: biz.value }))
            .catch(err => {
                if (err.message === 'not found') {
                    return next(null, { err: { msg: 'NOT_FOUND', detail: 'Business not found' } });
                }
                if (err.message === 'Invalid id' || err.message === 'Invalid biz_id') {
                    return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid biz id' } });
                }
                return util.serviceError(err, 'follow service', next);
            });
    });
};

export const unFollow = (message, next) => {
    Joi.validate(message.data, validation.follow, (err, validatedData) => {
        if (err) {
            return util.validationError(err, 'business unfollow service', next);
        }
        if (validatedData.biz_id === validatedData.follow_id) {
            return next(null, { err: { msg: 'SELF_FOLLOW', detail: 'Can\'t unfollow yourself' } });
        }
        db.updateFollow(validatedData.biz_id, validatedData.follow_id, true)
            .then(biz => {
                return next(null, { data: biz.value });
            })
            .catch(err => {
                if (err.message === 'not found') {
                    return next(null, { err: { msg: 'NOT_FOUND', detail: 'Business not found' } });
                }
                if (err.message === 'Invalid id' || err.message === 'Invalid biz_id') {
                    return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid biz id' } });
                }
                return util.serviceError(err, 'follow service', next);
            });
    });
};

export const getFollowers = (message, next) => {
    Joi.validate(message.data, validation.getBiz, (err, biz) => {
        if (err) {
            return util.validationError(err, 'get follower service ', next);
        }
        Promise.all([ksocutil.safeObjectId(message.data.bizid), db.getFollowersByBizId(biz.biz_id)])
            .then(follower => { next(null, { data: follower }) })
            .catch(err => util.serviceError(err, 'Get Follower service', next));
    });
};

export const getFollowing = (message, next) => {
    Joi.validate(message.data, validation.getFollowing, (err, data) => {
        if (err) {
            return util.validationError(err, 'get following service ', next);
        }
        db.getFollowingByBizId(data.biz_id)
            .then((followingIds) => db.findBizById(followingIds))
            .then(biz => next(null, { data: biz }))
            .catch(err => {
                if (err.message === 'not found') {
                    return next(null, { err: { msg: 'NOT_FOUND', detail: 'Business not found' } });
                }
                if (err.message === 'Invalid id' || err.message === 'Invalid biz_id') {
                    return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid biz id' } });
                }
                return util.serviceError(err, 'get following service', next);
            });
    });

};

export const getFollowersCountByBizId = (message, next) => {
    Joi.validate(message.data, validation.getBiz, (err, biz) => {
        if (err) {
            return util.validationError(err, 'get followers count by biz id service ', next);
        }
        db.getFollowersCountByBizId(biz.biz_id)
            .then(count => next(null, { count: count }))
            .catch(err => util.serviceError(err, 'get biz by id service', next));
    });
};

export const getAllBizExceptMe = (message, next) => {
    db.getAllBizExcept(message.data.user_id)
        .then(data => {
            next(null, { data: data })
        })
        .catch((ex) => {
            console.log(ex);
        });
};


export const getFollowingBizOfUser = (message, next) => {
    db.getFollowingBizOfUser([message.data.user_id])
        .then(data => {
            next(null, { data: data })
        })
        .catch(next);
};




export const getBizByName = (requestData, done) => {
    Joi.validate(requestData.data, validation.bizByName, (err, validatedData) => {
        if (err) {
            return done(err);
        }
        db.getBizByName(validatedData.bizName, 'business')
            .then(data => done(null, { data: data }))
            .catch(done);
    });

};

export const getBizOfUser = (requestData, done) => {
    Joi.validate(requestData.data, validation.bizOfUser, (err, validatedData) => {
        if (err) {
            return done(err);
        }
        db.getBizOfUser(validatedData.user_id, 'business')
            .then(res => {
                done(null, { data: res })
            })
            .catch(done);
    });
};

export const deleteBiz = (requestData, done) => {
    db.deleteBiz(requestData.data.bizId)
        .then(res => {
            done(null, {});
        })
        .catch(done);
};


export const getFavoriteBizbyUserId = (requestData, done) => {
    db.getFavoriteBizByUserId(requestData.data.user_id)
        .then(res => done(null, { data: res }))
        .catch(done);
};

export const getCountForBizByUserId = (requestData, done) => {
    db.getCountForBizByUserId(requestData.data.user_id)
        .then(count => done(null, { count: count }))
        .catch(done);
};
