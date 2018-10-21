'use strict';
import * as util from './util';
import * as MongoDb from 'mongodb';

const mongo = require('mongodb').MongoClient;
const log = require('karmasoc-util').logger;
let config = require('config');

const mongoUrl =  config.get("db.karmasoc-business.dbcon");
export var database = {};


export function addPromoBiz(message) {
    let collection = this.database.collection('promos');
    return collection.insertOne(message);
}

export function findDataNearby(collectionId, long, lat, options) {

    options.spherical = true;
    options.distanceMultiplier = 6371;

    let collection = this.database.collection(collectionId);
    return collection.geoNear(long, lat, options);
}

export function genericById(id, collectionId) {
    return util.safeObjectId(id)
        .then(oId => {
            return this.database.collection(collectionId)
                .find({ _id: oId })
                .limit(-1)
                .next()
                .then(res => {
                    if (!res) {
                        log.error('No document found for', { collection: collectionId, id: id });
                        throw Error('not found');
                    }
                    return res;
                });
        });
}

export function genericById2(id, collectionId) {
    return util.safeObjectId(id)
        .then(oId => {
            return this.database.collection(collectionId)
                .find({ _id: oId })
                .limit(-1)
                .next();
        });
}

export function getBizOfUser(userId, collectionId) {
    /*return util.safeObjectId(userId)
        .then(oId => {*/
    return this.database.collection(collectionId)
        .find({ userId: userId })
        .sort({ create_date: -1 })
        .toArray();
    //  });
}


export function getBizByName(businessName, collectionId) {
    let pattern = new RegExp(businessName);

    return this.database.collection(collectionId)
        .find({ title: { $regex: pattern, $options: 'i' } })
        .toArray();
}

export function findBizById(bizId) {
    return genericById(bizId, 'business');
}

export function findBizByTitle(message) {
    let collection = this.database.collection('business');
    return collection.find({ title: message });
}

export function getFollowersByBizId(id) {
    let collection = this.database.collection('business');
    return util.safeObjectId(id, 'business_id')
        .then(oId => collection
            .find({ 'following': oId })
            .toArray());
}


export function getAllBizExcept(userId) {
    let collection = this.database.collection('business');
    return collection
        .find({ $and: [{ following: { $nin: [userId] } }, { userId: { $ne: userId } }] })
        .toArray();
}

export function getFollowingBizOfUser(userId) {
    let collection = this.database.collection('business');
    return collection
        .find({ following: { $in: [userId] } })
        .toArray();
}


export function getFollowingByBizId(id) {
    return this.findUserById(id)
        .then((biz) => (biz && biz.following) ? biz.following : []);
}

export function getFollowersCountByBizId(id) {
    let collection = this.database.collection('business');
    return collection
        .count({
            following: id
        });
}

export function addNewBiz(message) {
    let collection = this.database.collection('business');
    return collection.insertOne(message);
}

export function deleteBiz(businessId) {
    let collection = this.database.collection('business');
    return util.safeObjectId(businessId)
        .then(oId => {
            return collection.deleteOne({ '_id': oId });
        });

}

export function hasUserBizFavored(businessId, userId) {
    return util.safeObjectId(businessId)
        .then(oId => {
            return this.database.collection('business')
                .find({ '_id': oId, 'favorites': userId })
                .limit(-1)
                .toArray()
                .then(res => {
                    return !!res.length;
                });
        });
}

export function updateFavor(businessId, userId, remove) {
    let operation = remove ? '$pull' : '$addToSet';
    let updateObject = {};
    updateObject[operation] = {
        favorites: userId
    };

    return util.safeObjectId(businessId, 'business_id')
        .then(oId => {
            return this.database.collection('business')
                .findOneAndUpdate({
                    '_id': oId
                }, updateObject);
        });
}

export function addImageToBiz(bizId, images) {
    let collection = this.database.collection('business');
    return util.safeObjectId(this.businessId, 'business_id')
        .then(oId => {
            return collection
                .findOneAndUpdate({ _id: oId }, {
                    $set: {
                        images: images
                    }
                }, { returnOriginal: false });
        });
}

export function addBgImageToBiz(bizId, images) {
    let collection = this.database.collection('business');
    return util.safeObjectId(bizId, 'business_id')
        .then(oId => {
            return collection
                .findOneAndUpdate({ _id: oId }, {
                    $set: {
                        backgroundImage: images
                    }
                }, { returnOriginal: false });
        });
}

export function genericInsertOne(obj, collectionId) {
    let insert = util.decorateNewDateData(obj);
    return this.database.collection(collectionId).insertOne(insert);
}

export function getFavoriteBizByUserId(userId) {
    return this.database.collection('business')
        .find({
            'favorites': userId
        })
        .toArray();
}

export function getCountForBizByUserId(userId) {
    return this.database.collection('business')
        .count({
            'user_id': userId
        });
}

export function updateFollow(bizId, toFollow, unfollow) {
    let operation = unfollow ? '$pull' : '$addToSet';
    let updateObject = {};
    return Promise.all([util.safeObjectId(bizId, 'business_id')])
        .then((ids) => {
            updateObject[operation] = {
                following: toFollow
            };
            return this.database.collection('business')
                .findOneAndUpdate({ _id: ids[0] },
                    updateObject, { returnOriginal: false });
        });
};


export function follow(bizId, toFollow) {
    let collection = this.database.collection('business');
    return util.safeObjectId(bizId, 'business_id')
        .then(oId => {
            return collection
                .findOneAndUpdate({ _id: oId }, {
                    '$addToSet': {
                        following: toFollow
                    }
                }, { returnOriginal: false });
        });
}


export function unFollow(bizId, toFollow) {
    let collection = this.database.collection('business');
    return util.safeObjectId(bizId, 'business_id')
        .then(oId => {
            return collection
                .findOneAndUpdate({ _id: oId }, {
                    '$pull': {
                        following: toFollow
                    }
                }, { returnOriginal: false });
        });
}


export function setupDb(db) {
    console.log('setting up database');
    let business = db.collection('business').createIndex({ 'geotag.coordinates': '2dsphere' });
    let geobiz = db.collection('geobiz').createIndex({ 'geotag.coordinates': '2dsphere' });

    return Promise.all([business, geobiz]);
}

export function getAllBizCategories() {
    return  this.database.collection('categories')
        .find({})
        .toArray();
}

export function getSubcategories(category_id, collectionId) {
    return util.safeObjectId(category_id)
        .then(oId => {
            return this.database.collection(collectionId)
                .find({ category_id: oId })
                .toArray();
        });
}

/**
 * connects to the database
 * @returns {Promise|*}
 */
export function connect() {
    console.log('open database', mongoUrl);
    return MongoDb.MongoClient.connect(mongoUrl)
        .then(db => {
            console.log('database successfully connected');
            database = db.db("business");
            return setupDb(db);
        })
        .then(() => {
            console.log('db setup successful');
        })
        .catch(err => {
            console.error('unable to connect to database', err);
        });
}