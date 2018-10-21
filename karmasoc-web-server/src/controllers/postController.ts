import * as Boom from 'boom';
import * as boom from 'boom';
import { Post, AccessType, FileDetails, PhotoDetails } from '../model/posts';
import * as redis from 'redis';

import { ThumboUrl } from '../util/thumbor/thumborUrlBuilder';

'use strict';



const redisClient = require('../session/session')() as redis.RedisClient;
const Wreck = require('wreck');


const util = require('../util/util');
const helper = require('../util/responseHelper');
const google = require('../util/googleutil');

const utilities = require('karmasoc-util');
const log = utilities.logger;
const slack = utilities.slack;

const configuration = require('config');
const proxyUri = configuration.get("env.host.karmasoc-mediaserve") + ":" + configuration.get("env.port.karmasoc-mediaserve");

const basicPin = {
    role: 'posts'
};


module.exports = {
    genericpost,
    createTempImageLoc,
    deletePost,
    postFavorPost,
    postUnfavorPost,
    postToggleFavorPost,
    postTextImpression,
    createImpressionAfterImageUpload,
    createImpressionAfterVideoUpload,
    createImpressionAfterAudioUpload,
    getLocationByName,
    getSettings,
    updateSettings
};

function getLocationByName(request, reply) {

    let senecaAct;
    let name = request.query.locationName;
    let long = request.query.long;
    let lat = request.query.lat;

    if (name) {
        senecaAct = util.setupSenecaPattern('locationbyname', { locationName: request.query.locationName }, basicPin);
    }
    else {
        senecaAct = util.setupSenecaPattern('nearby', request.query, basicPin);
    }

    let gFinds = google.locationSearch(name, lat, long);

    let dbPromise = request.server.pact(senecaAct);


    Promise.all([dbPromise, gFinds])
        .then(value => {
            let dbLocations = helper.unwrap(value[0]);
            let googleLocations = value[1];

            let result = {
                google: googleLocations,
                locator: dbLocations
            };

            reply(result);
        })
        .catch(error => {
            reply(boom.badRequest(error));
        });
}

function postTextImpression(request, reply) {

    let userId = request.basicSenecaPattern.requesting_user_id;

    request.basicSenecaPattern.cmd = 'addimpression';
    //   request.basicSenecaPattern.type = 'text';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        postId: request.params.postId,
        userId: userId,
        text: request.payload.text,
        mentions: request.payload.mentions,
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        /*.then(() => {
             // send push notifications
                    let pushPattern = util.clone(request.basicSenecaPattern);
                    pushPattern.cmd = 'notify';
                    pushPattern.entity = 'newImpression';

                    let pushAct = util.setupSenecaPattern(pushPattern,
                        {
                            post_id: request.payload.data.postId,
                            user_id: request.payload.data.userId,
                            user_name: request.auth.credentials.name,
                            type: request.basicSenecaPattern.type
                        },
                        {role: 'notifications'});

                    request.server.pact(pushAct);
        })*/
        .catch(error => {
            if (error.message.includes('Invalid id.')) {
                return reply(boom.notFound('postId'));
            }
            reply(boom.badImplementation(error));
        });

}


function createImpressionAfterImageUpload(err, res, request, reply) {

    genericImpressionFileResponseHandler(err, res, request, reply, 'image');
}

function createImpressionAfterVideoUpload(err, res, request, reply) {

    genericImpressionFileResponseHandler(err, res, request, reply, 'video');
}

function createImpressionAfterAudioUpload(err, res, request, reply) {

    genericImpressionFileResponseHandler(err, res, request, reply, 'audio');
}

function genericImpressionFileResponseHandler(err, res, request, reply, type) {

    if (err) {
        log.fatal(err, 'Got error after image upload for location');
        return reply(boom.badRequest());
    }

    // read response
    Wreck.read(res, { json: true }, (err, response) => {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from ms-fileserve');
            return reply(boom.badRequest());
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }

        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'addimpression';
        pattern.type = type;

        let message = {
            postId: request.params.postId,
            text: response.post.text,
            mentions: response.post.mentions,
            userId: util.getUserId(request.auth),
            file: {
                id: response._id,
                name: response.filename
            }
        };


        let senecaAct = util.setupSenecaPattern(pattern, message, basicPin);

        request.server.pact(senecaAct)
            .then(helper.unwrap)
            .then(res => {

                reply(res);


                if (res.isBoom) {
                    // remove the uploaded image again by making an internal DELETE request
                    Wreck.delete(proxyUri + '/file/' + response._id, (err) => {
                        if (err) {
                            log.error(err, 'Error Deleting file type ' + type, { id: response._id });
                        }
                    });

                } else {

                    // dont send push if not defined
                    if (!message.userId || !message.postId) {
                        return;
                    }
                    // send push notifications
                    //PUSH Message
                    let pushPattern = util.clone(request.basicSenecaPattern);
                    pushPattern.cmd = 'notify';
                    pushPattern.entity = 'newImpression';

                    let pushAct = util.setupSenecaPattern(pushPattern,
                        {
                            post_id: message.postId,
                            user_id: message.userId,
                            user_name: request.auth.credentials.name,
                            type: type
                        },
                        { role: 'notifications' });

                    request.server.pact(pushAct);
                }
            })
            .catch(error => reply(boom.badImplementation(error)));
    });
}


function genericpost(request, reply) {
    let userId = request.basicSenecaPattern.requesting_user_id;
    request.basicSenecaPattern.cmd = 'newPost';
    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'newPost';

    let post: Post = {
        userId: request.basicSenecaPattern.requesting_user_id,
        text: request.payload.text,
        mentions: request.payload.mentions,
        bizId: request.payload.bizId,
        postType: 'text',
        withFriends: request.payload.withFriends ? request.payload.withFriends : [],
        access: request.payload.access ? request.payload.access : AccessType[AccessType.public],
        geotag: request.payload.geotag,
        shares: [],
        likes: []
    };

    if (request.payload.clientId) {
        redisClient.get(request.payload.clientId, function (rediserror, redisReply) {
            if (redisReply) {
                let files = JSON.parse(redisReply);
                post.photos = files.images;
                post.fileUrl = files.videos;
            }
            redisClient.del(request.payload.clientId);
            postToService(request, pattern, post, reply);
        });
    } else {
        postToService(request, pattern, post, reply);
    }
}

function postToService(request, pattern, post, reply) {
    let senecaAct = util.setupSenecaPattern(pattern, post, basicPin);
    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(res => {
            if (res.photos && res.photos.length >= 1) {
                res = Object.assign({}, res, {
                    photos: res.photos.map(photo => {
                       return Object.assign({}, photo, {
                            xlarge: photo["xlarge"].replace('thumborserver', configuration.get("thumbor.server")),
                            large: photo["large"].replace('thumborserver', configuration.get("thumbor.server")),
                            normal: photo["normal"].replace('thumborserver', configuration.get("thumbor.server")),
                            small: photo["small"].replace('thumborserver', configuration.get("thumbor.server"))
                        });
                    })
                });
            }
            reply(res);

            if (res.isBoom) {
                post.photos.forEach(photo => {
                    [photo.xlarge, photo.large, photo.normal, photo.small].forEach((_id) => {
                        Wreck.delete(proxyUri + '/file/' + _id, (err) => {
                            if (err) {
                                log.error(err, 'Error Deleting file type ' + post.postType, { id: reply._id });
                            }
                        });
                    });
                })
            }
        })
        .catch(error => reply(boom.badImplementation(error)));
}


function createTempImageLoc(err, res, request, reply) {
    let imageRegex = new RegExp("(gif|jpg|jpeg|tiff|png)$")

    if (err) {
        log.fatal(err, 'Got error after image upload for post');
        return reply(boom.badRequest());
    }

    // read response
    Wreck.read(res, { json: true }, (err, response) => {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from karmasoc-mediaserve');
            return reply(boom.badRequest());
        }
        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }
        let fileLoc: PhotoDetails | FileDetails;
        if (imageRegex.test(response.file.ext)) {
            fileLoc = {
                ext: response.file.ext,
                key: response.file.key,
                small: ThumboUrl.smallPhoto(response.file.key),
                normal: ThumboUrl.normalPhoto(response.file.key),
                large: ThumboUrl.largePhoto(response.file.key),
                xlarge: ThumboUrl.verylargePhoto(response.file.key)
            };
        } else {
            fileLoc = {
                id: response.filename,
                //ext: response.ext ,
                thumbnail: response.thumbnail
            }
        }
        redisClient.get(response.payload.clientId, function (rediserror: Error, redisResp) {
            if (rediserror) {
                reply(boom.create(500, rediserror.message, rediserror));
            }
            else if (redisResp) {
                let rep = JSON.parse(redisResp);
                if (imageRegex.test(response.file.ext)) {
                    rep.images = [...rep.images, fileLoc];
                }
                else {
                    rep.videos = [...rep.videos, fileLoc]
                }
                redisClient.set(response.payload.clientId, JSON.stringify(rep));
                const fileresponse = Object.assign({}, fileLoc, {
                    xlarge: fileLoc["xlarge"].replace('thumborserver', configuration.get("thumbor.server")),
                    large: fileLoc["large"].replace('thumborserver', configuration.get("thumbor.server")),
                    normal: fileLoc["normal"].replace('thumborserver', configuration.get("thumbor.server")),
                    small: fileLoc["small"].replace('thumborserver', configuration.get("thumbor.server"))
                })

                reply(fileresponse);
            } else {
                let files = {
                    images: [],
                    videos: []
                };
                if (imageRegex.test(response.file.ext)) {
                    files.images = [...files.images, fileLoc];
                }
                else {
                    files.videos = [...files.videos, fileLoc]
                }
                redisClient.set(response.payload.clientId, JSON.stringify(files));
                const fileresponse = Object.assign({}, fileLoc, {
                    xlarge: fileLoc["xlarge"].replace('thumborserver', configuration.get("thumbor.server")),
                    large: fileLoc["large"].replace('thumborserver', configuration.get("thumbor.server")),
                    normal: fileLoc["normal"].replace('thumborserver', configuration.get("thumbor.server")),
                    small: fileLoc["small"].replace('thumborserver', configuration.get("thumbor.server"))
                })
                reply(fileresponse);
            }
        });
    });
}

/* function createPostAfterImageUpload(err, res, request, reply) {

    if (err) {
        log.fatal(err, 'Got error after image upload for post');
        return reply(boom.badRequest());
    }

    // read response
    Wreck.read(res, {json: true}, (err, response) => {

        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from karmasoc-mediaserve');
            return reply(boom.badRequest());
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }


        let post : post = {
            userId: request.basicSenecaPattern.requesting_user_id,
            text: response.post.text,
            postType: <postType>response.post.postType,
            bookmarks: request.bookmark,
            photos: <photoUrlDb[]>[{
                name: response.images.name,
                path: '/api/v2/posts/image/',
                xlarge: response.images.xlarge,
                large:  response.images.large ,
                normal: response.images.normal,
                small:  response.images.small
            }],
            withFriends: <string[]>response.post.withFriends,
            access: <accessType>response.post.access,
            shares: [],
            likes: []
        };

        let senecaAct = util.setupSenecaPattern(pattern, post, basicPin);
        request.server.pact(senecaAct)
            .then(helper.unwrap)
            .then(post => {
                reply(post);

                if (res.isBoom) {
                    let ids : number[] = [response.images.xlarge, response.images.large, response.images.normal, response.images.small];
                    //remove images
                    ids.forEach((_id) => {
                        Wreck.delete(proxyUri + '/file/' + _id, (err) => {
                            if (err) {
                                log.error(err, 'Error Deleting file type ' + response.post.postType, {id: response._id});
                            }
                        });
                    });
                }
            })
            .catch(error => reply(boom.badImplementation(error)));
    });
}
*/



function genericFileResponseHandler(err, res, request, reply, type) {

    if (err) {
        log.fatal(err, 'Got error after image upload for location');
        return reply(boom.badRequest());
    }

    // read response
    Wreck.read(res, { json: true }, (err, response) => {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from karmasoc-mediaserve');
            return reply(boom.badRequest());
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'newVideoPost';
        let post: Post = {
            userId: request.basicSenecaPattern.requesting_user_id,
            text: response.post.text,
            mentions: response.post.mentions,
            // postType: postModel.postType[postModel.postType.video],
            bookmarks: request.bookmark,
            withFriends: <string[]>response.post.withFriends,
            access: response.post.access ? response.post.access : AccessType[AccessType.public],
            shares: [],
            likes: []
        };

        let senecaAct = util.setupSenecaPattern(pattern, post, basicPin);

        request.server.pact(senecaAct)
            .then(helper.unwrap)
            .then(res => {
                reply(res);
                if (res.isBoom) {
                    // remove the uploaded image again by making an internal DELETE request
                    Wreck.delete(proxyUri + '/file/' + response._id, (err) => {
                        if (err) {
                            log.error(err, 'Error Deleting file type ' + type, { id: response._id });
                        }
                    });

                } else {
                    //Push notification
                    //TODO
                }
            })
            .catch(error => reply(boom.badImplementation(error)));
    });
}


function deletePost(request, reply) {
    request.basicSenecaPattern.cmd = 'deletePost';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });
    //TODO remove media files for the post. remove all impressions for the post..
}

function postToggleFavorPost(request, reply) {
    let pushPattern = util.clone(request.basicSenecaPattern);

    request.basicSenecaPattern.cmd = 'toggleFavorPost';
    let userId = request.basicSenecaPattern.requesting_user_id;

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        postId: request.params.postId,
        userId: userId,
        like: request.payload.favor
    }, basicPin);

    request.server.pact(senecaAct)
        .then(response => {
            reply(response);
            return response;
        })
        .then(response => {
            if (response.added) {
                return notifyUserForNewLike(pushPattern, request);
            }
        })
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
}

function postFavorPost(request, reply) {
    let pushPattern = util.clone(request.basicSenecaPattern);
    request.basicSenecaPattern.cmd = 'favorPost';
    genericUnFavorPost(request, reply)
        .then(() => {
            notifyUserForNewLike(pushPattern, request)
        })
        .catch(err => log.warn('error happend', err));
}

function postUnfavorPost(request, reply) {
    request.basicSenecaPattern.cmd = 'unfavorPost';
    genericUnFavorPost(request, reply);
}

function genericUnFavorPost(request, reply) {
    let userId = request.basicSenecaPattern.requesting_user_id;

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        postId: request.params.postId,
        userId: userId,
        like: request.payload.favor
    }, basicPin);

    return request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
}



function getSettings(request, reply) {
    let pushPattern = util.clone(request.basicSenecaPattern);

    request.basicSenecaPattern.cmd = 'getSettings';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        postId: request.params.postId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(response => {
            reply(response);
            return response;
        })
        .then(response => {
            if (response.added) {
                return notifyUserForNewLike(pushPattern, request);
            }
        })
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
}

function updateSettings(request, reply) {
    let pushPattern = util.clone(request.basicSenecaPattern);
    request.basicSenecaPattern.cmd = 'updateSettings';
    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        postId: request.params.postId,
        settings: request.payload.settings
    }, basicPin);
    request.server.pact(senecaAct)
        .then(response => {
            reply(response);
            return response;
        })
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
}

//TODO pending impl
function notifyUserForNewShare(pushPattern, request) {
    pushPattern.cmd = 'notify';
    pushPattern.entity = 'newShare';

    let senecaAct = util.setupSenecaPattern(pushPattern, {
        post_id: request.params.postId,
        user_id: request.basicSenecaPattern.requesting_user_id,
        user_name: request.auth.credentials.name //todo get name
    }, { role: 'notifications' });
    return request.server.pact(senecaAct);
}


function notifyUserForNewLike(pushPattern, request) {
    pushPattern.cmd = 'notify';
    pushPattern.entity = 'post';
    pushPattern.action = 'newFavorator';

    /*let senecaAct = util.setupSenecaPattern(pushPattern, {
        post_id: request.params.postId,
        favorator_id: request.basicSenecaPattern.requesting_user_id
    }, { role: 'notifications' });
    return request.server.pact(senecaAct);
    */
}