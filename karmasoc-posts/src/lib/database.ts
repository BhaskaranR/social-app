'use strict';

import { safeObjectId, decorateNewDateData } from './util';
const log = require('karmasoc-util').logger;
let config = require('config');
import * as MongoDb from 'mongodb';

const mongoUrl = config.get("db.karmasoc-posts.dbcon");

export var database: any = {};

export function hasUserPostFavored(postId, userId) {
    return safeObjectId(postId)
        .then(oId => {
            return database.collection('posts')
                .find({ '_id': oId, 'favorites': { $elemMatch: { userId: userId } } })
                .limit(-1)
                .toArray()
                .then(res => {
                    return !!res.length;
                });
        });
}


export function updateFavor(postId, favorData, operation) {
    let updateObject = {};
    switch (operation) {
        case "update":
            /* updateObject["$set"] = {
                 "likes.$.like": favorData
             };*/
            return safeObjectId(postId, 'postId')
                .then(oId => {
                    return database.collection('posts')
                        .findOneAndUpdate({ '_id': oId, 'likes': { $elemMatch: { userId: favorData.userId } } }, { "$set": { "likes.$.like": favorData } });
                });
        case "add":
            /*updateObject["$addToSet"] = {
                likes: favorData
            };*/
            return safeObjectId(postId, 'postId')
                .then(oId => {
                    return database.collection('posts')
                        .findOneAndUpdate({ '_id': oId }, { '$addToSet': { likes: favorData } }, { returnNewDocument: true });
                });
        case "remove":
            /*updateObject["$pull"] = {
                likes: favorData
            };
            */
            return safeObjectId(postId, 'postId')
                .then(oId => {
                    return database.collection('posts')
                        .findOneAndUpdate({ '_id': oId, 'likes': { $elemMatch: { userId: favorData.userId } } }, { "$pull": { "likes": { "userId": favorData.userId } } });
                });
    }

}

export function addNewPost(message) {
    let collection = database.collection('posts');
    return collection.insertOne(message);
}

export function deletePost(postId) {
    let collection = database.collection('posts');
    return safeObjectId(postId)
        .then(oId => {
            return collection.deleteOne({ '_id': oId });
        });
}

export function deleteImpression(impressionId) {
    let collection = database.collection('impressions');
    return safeObjectId(impressionId)
        .then(oId => {
            return collection.deleteOne({ '_id': oId });
        });
}

export function genericInsertOne(obj, collectionId) {
    let insert = decorateNewDateData(obj);
    let collection = database.collection(collectionId);
    return collection.insertOne(insert);
}

export function genericById(id, collectionId) {
    return safeObjectId(id)
        .then(oId => {
            return database.collection(collectionId)
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


export function getImpressionsByPostId(obj : {postId: string, offset: number, limit: number}) {
    // TODO include query for pagination
    return database.collection('impressions')
        .find({ postId: obj.postId })
        .skip(obj.offset)
        .limit(obj.limit)
        .sort({ 'create_date': -1 })
        .toArray();
}

export function getPostsOfUser(userId, collectionId) {
    return database.collection(collectionId)
        .find({ userId: userId })
        .sort({ create_date: -1 })
        .toArray();
}

export function getCountForPostsByUserId(userId) {
    return database.collection("posts")
        .count({
            'userId': userId
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
            database = db.db("posts");

        })
        .then(() => {
            console.log('db setup successful');
        })
        .catch(err => {
            console.error('unable to connect to database', err);
        });
}

export function getSettings(postId, userId) {
    return genericById(postId, 'posts')
        .then(post => (post && post.settings) ? post.settings : {})
}

export function updateSettings(postId, userId, settings) {
    return safeObjectId(postId)
        .then(oId => {
            database.collection('posts')
                .update({ '_id': oId }, {
                    $set: {
                        settings: settings
                    }
                });
        });
}

/**
 * function implementations
 */
export function getPostsById(ids: string[]) {
    return database.collection("posts").find({
        _id: { $in: ids }
    }).toArray()
}

export function getPostByPostId(ids: string[]) {
    return safeObjectId(ids[0], 'post_id')
        .then(oId => {
            return database.collection("posts").find({
                _id: oId
            }).toArray()
        });
}

export function getAllPostByPostId(obj: Array<{ postIds: Array<string>, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            _id: { $in: obj[0].postIds }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return [val];
        });
}

export function getAllImpressionsForPostIds(obj : Array<{postIds: Array<string>, offset: number, limit: number}>) {
    return database.collection("impressions")
        .find({
            post_id:  { $in: obj[0].postIds }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return [val];
        });
}


export function getAllPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            userId: { $in: obj[0].userIds }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return val;
        });
}


export function getProfilePostByUserId(obj: Array<{ userId: string, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            $or: [
                { userId: obj[0].userId }, //posted by
                { likes: obj[0].userId },  // liked by
                { shares: obj[0].userId }, // shared by
                { bookmarks: { $elemMatch: { userId: obj[0].userId } } } // bookmarked by
            ]
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return val;
        });
}

export function getGalleryPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            userId: { $in: obj[0].userIds },
            postType: { $in: ["image"] }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return val;
        });
}

export function getPostByUserIdandPostType(obj: Array<{ userIds: Array<string>, postType: Array<string>, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            userId: { $in: obj[0].userIds },
            photos: { $exists: true, $ne: null }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return val;
        });
}

export function getFunPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            bookmarks: { $elemMatch: { userId: { $in: obj[0].userIds }, bookMark: { $elemMatch: { $in: ['fun'] } } } }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return val;
        });
}

export function getLearnPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            bookmarks: { $elemMatch: { userId: { $in: obj[0].userIds }, bookMark: { $elemMatch: { $in: ['learn'] } } } }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return val;
        });
}

export function getMyPagePostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    return database.collection("posts")
        .find({
            bookmarks: { $elemMatch: { userId: { $in: obj[0].userIds }, bookMark: { $elemMatch: { $in: ['mypage'] } } } }
        })
        .skip(obj[0].offset)
        .limit(obj[0].limit)
        .sort({ "create_date": -1 })
        .toArray()
        .then(val => {
            return val;
        });
}