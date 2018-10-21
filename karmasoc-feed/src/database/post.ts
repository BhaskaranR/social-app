import { bookmark, post } from '../dbschemas/posts';

import { MongoClient } from 'mongodb';

let config = require('config');
const DataLoader = require('dataloader');
var utilities = require('karmasoc-util');
var log = utilities.logger;


const mongoUrl =  config.get("db.karmasoc-posts.dbcon") ;

log.info(`using db ${mongoUrl} for Post`);
const conn = MongoClient.connect(mongoUrl)
    .then((db) => {
        log.info(`successfully connected to post db`);
        return db.db("posts");
    })
    .catch((e) => {
        log.error("error connecting to db", e);
        throw e;
    });



export function createLoaders() {
    return {
        postDataloaderById: new DataLoader(_getPostsById, {
        }),
        postDataloaderByPostId: new DataLoader(_getPostByPostId, {
        }),
        postDataloaderByAllPostId: new DataLoader(_getAllPostByPostId, {
            batch: false
        }),
        postDataloaderByUserId: new DataLoader(_getAllPostByUserId, {
            batch: false
        }),
        postDataloaderByUserIdAndPostType: new DataLoader(_getPostByUserIdandPostType, {
            batch: false
        }),
        gallaryPostDataloaderByUserId: new DataLoader(_getPostByUserIdandPostType, {
            batch: false
        }),
        funPostDataloaderByUserId: new DataLoader(_getFunPostByUserId, {
            batch: false
        }),
        learnPostDataloaderByUserId: new DataLoader(_getLearnPostByUserId, {
            batch: false
        }),
        myPagePostDataloaderByUserId: new DataLoader(_getMyPagePostByUserId, {
            batch: false
        }),
        profilePostDataloaderByUserId: new DataLoader(_getProfilePostByUserId, {
            batch: false
        })
    }
}

/**
 * Exported Functions which uses data loader to load the data.
 */
export function getPostsById(loaders: any, ids: string[]): Promise<post> {
    return loaders.postDataloaderById.loadMany(ids)
}
export function getPostByPostId(loaders: any, postId: string): Promise<post> {
    return loaders.postDataloaderByPostId.load(postId)
}
/**
 * Returns 
 */
export function getPostByUserId(loaders: any, userIds: string[], offset: number, limit: number): Promise<post[]> {
    return loaders.postDataloaderByUserId.load({ userIds, offset, limit });
}

export function getAllPostByPostId(loaders: any, postIds: string[], offset: number, limit: number): Promise<post[]> {
    return loaders.postDataloaderByAllPostId.load({ postIds, offset, limit });
}

export function getProfilePostByUserId(loaders: any, userId: string, offset: number, limit: number): Promise<post[]> {
    return loaders.profilePostDataloaderByUserId.load({ userId, offset, limit });
}

export function getPostByUserIdandPostType(loaders: any, userIds: string[], postType: string[], offset: number, limit: number): Promise<post[]> {
    return loaders.postDataloaderByUserIdAndPostType.load({ userIds, postType, offset, limit });
}

export function getGallaryPostByUserId(loaders: any, userIds: string[], offset: number, limit: number): Promise<post[]> {
    return loaders.gallaryPostDataloaderByUserId.load({ userIds, offset, limit });
}

export function getFunPostByUserId(loaders: any, userIds: string[], offset: number, limit: number): Promise<post[]> {
    return loaders.funPostDataloaderByUserId.load({ userIds, offset, limit });
}

export function getLearnPostByUserId(loaders: any, userIds: string[], offset: number, limit: number): Promise<post[]> {
    return loaders.learnPostDataloaderByUserId.load({ userIds, offset, limit });
}

export function getMyPagePostByUserId(loaders: any, userIds: string[], offset: number, limit: number): Promise<post[]> {
    return loaders.myPagePostDataloaderByUserId.load({ userIds, offset, limit });
}

/**
 * function implementations
 */
function _getPostsById(ids: string[]) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts").find({
            _id: { $in: ids }
        })
            .toArray()
    })
}

function _getPostByPostId(ids: string[]) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => 
        utilities.safeObjectId(ids[0], 'post_id')
            .then(oId => {
                return db.collection("posts").find({
                    _id: oId
                }).toArray()
            }));
}

function _getAllPostByPostId(obj: Array<{ postIds: Array<string>, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts")
            .find({
                _id: { $in: obj[0].postIds }
            })
            .skip(obj[0].offset)
            .limit(obj[0].limit)
            .sort({ "create_date": -1 })
            .toArray()
            .then(val => {
                return [val];
            })

    })
}

function _getAllPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts")
            .find({
                userId: { $in: obj[0].userIds }
            })
            .skip(obj[0].offset)
            .limit(obj[0].limit)
            .sort({ "create_date": -1 })
            .toArray()
            .then(val => {
                return [val];
            })

    })
}


function _getProfilePostByUserId(obj: Array<{ userId: string, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts")
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
                return [val];
            })

    })
}

function _getGalleryPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts")
            .find({
                userId: { $in: obj[0].userIds },
                postType: { $in: ["image"] }
            })
            .skip(obj[0].offset)
            .limit(obj[0].limit)
            .sort({ "create_date": -1 })
            .toArray()
            .then(val => {
                return [val];
            })

    })
}

function _getPostByUserIdandPostType(obj: Array<{ userIds: Array<string>, postType: Array<string>, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        // {userId: { $in:  obj[0].userIds},  obj[0].postType[0]: { $exists: true, $ne: null } }
        return db.collection("posts")
            .find({
                userId: { $in: obj[0].userIds },
                photos: { $exists: true, $ne: null }
            })
            .skip(obj[0].offset)
            .limit(obj[0].limit)
            .sort({ "create_date": -1 })
            .toArray()
            .then(val => {
                return [val];
            })

    })
}

function _getFunPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts")
            .find({
                bookmarks: { $elemMatch: { userId: { $in: obj[0].userIds }, bookMark: { $elemMatch: { $in: ['fun'] } } } }
            })
            .skip(obj[0].offset)
            .limit(obj[0].limit)
            .sort({ "create_date": -1 })
            .toArray()
            .then(val => {
                return [val];
            })

    });
}

function _getLearnPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts")
            .find({
                bookmarks: { $elemMatch: { userId: { $in: obj[0].userIds }, bookMark: { $elemMatch: { $in: ['learn'] } } } }
            })
            .skip(obj[0].offset)
            .limit(obj[0].limit)
            .sort({ "create_date": -1 })
            .toArray()
            .then(val => {
                return [val];
            })

    });
}

function _getMyPagePostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    log.info(JSON.stringify(arguments));
    return conn.then((db) => {
        return db.collection("posts")
            .find({
                bookmarks: { $elemMatch: { userId: { $in: obj[0].userIds }, bookMark: { $elemMatch: { $in: ['mypage'] } } } }
            })
            .skip(obj[0].offset)
            .limit(obj[0].limit)
            .sort({ "create_date": -1 })
            .toArray()
            .then(val => {
                return [val];
            })

    });
}



`
query Feeds($feedtype: String) {
  feeds(feedType: $feedtype) {
    id
    text
    geotag{
      type
      coordinates{
        lat
        long
      },
      title,
      placeId
    }
    videoUrl
    audioUrl
    photos{
      xlarge
      large
      normal
      small
      key
    }
    with
    type
    public
    userId
    shares
    likes
    bookmarks{
      mypage
      fun
      learn
    }
  }
}

`

