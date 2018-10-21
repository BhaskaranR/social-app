import * as util from '../util/util';
import { bookmark, post } from '../dbschemas/posts';
import { unwrap } from '../util/responseHelper';
import { MongoClient } from 'mongodb';
import { pact } from '../server';

let config = require('config');
const DataLoader = require('dataloader');

var utilities = require('karmasoc-util');
var log = utilities.logger;

  /*  .then((db) => {
        log.info(`successfully connected to post db`);
        return db.db("posts");
    })
    .catch((e) => {
        log.error("error connecting to db", e);
        throw e;
    }); `````````````````````````````
    */



export function createLoaders() {
    return {
        commentsDataloaderById: new DataLoader(_getCommentsByPostIds, {
            batch: false
        }),
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

export function getPostByUserIdandPostType(loaders: any, userIds: string[],
    postType: string[], offset: number, limit: number): Promise<post[]> {
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

export function sendComments(newMessage) {
    const cmdOrMoreComplexObject = {
        cmd: 'addimpression'
    }
    const request = util.setupSenecaPattern(cmdOrMoreComplexObject, newMessage, {
        role: 'posts'
    });
    pact(request)
        .then((result) => {
            return [unwrap(result) as Array<any>];
        })
        .catch((err) => {
            log.error("error occured", err)
            return [];
        })
}

/**
 * function implementations
 */
function _getPostsById(ids: string[]) {
    log.info(JSON.stringify(arguments));
    let cmdOrMoreComplexObject = {
        cmd: 'getPostsById'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                ids: ids
            }, {
                role: 'posts'
            });

    return  pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}

function _getPostByPostId(ids: string[]) {

    let cmdOrMoreComplexObject = {
        cmd: 'getPostByPostId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                ids: ids
            }, {
                role: 'posts'
            });

            return pact(request)
            .then((result) => {
                return [unwrap(result) as Array<any>];
            })
            .catch((err) => {
                log.error("error occured", err)
                return [];
            })
}


function _getCommentsByPostIds(obj: Array<{ postIds: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getAllImpressionsForPostIds'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}



function _getAllPostByPostId(obj: Array<{ postIds: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getAllPostByPostId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}

function _getAllPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getAllPostByUserId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}


function _getProfilePostByUserId(obj: Array<{ userId: string, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getProfilePostByUserId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}

function _getGalleryPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getGalleryPostByUserId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}

function _getPostByUserIdandPostType(obj: Array<{ userIds: Array<string>, postType: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getPostByUserIdandPostType'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}

function _getFunPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getFunPostByUserId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    })
}

function _getLearnPostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getLearnPostByUserId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    });
}

function _getMyPagePostByUserId(obj: Array<{ userIds: Array<string>, offset: number, limit: number }>) {
    let cmdOrMoreComplexObject = {
        cmd: 'getMyPagePostByUserId'
    }
    var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                obj: obj
            }, {
                role: 'posts'
            });

    return pact(request)
    .then((result) => {
        return [unwrap(result) as Array<any>];
    })
    .catch((err) => {
        log.error("error occured", err)
        return [];
    });
}