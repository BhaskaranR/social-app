"use strict";
var postModel = require('../model/posts');
'use strict';
var boom = require('boom');
var redisClient = require('../session/session')();
var Wreck = require('wreck');
var util = require('../util/util');
var helper = require('../util/responseHelper');
var google = require('../util/googleutil');
var utilities = require('karmasoc-util');
var log = utilities.logger;
var slack = utilities.slack;
var configuration = require('config');
var proxyUri = configuration.get("env.host.karmasoc-mediaserve") + ":" + configuration.get("env.port.karmasoc-mediaserve");
var basicPin = {
    role: 'posts'
};
module.exports = {
    postText: postText,
    createTempImageLoc: createTempImageLoc,
    createPostAfterVideoUpload: createPostAfterVideoUpload,
    createGeoTagAfterImageUpload: createGeoTagAfterImageUpload,
    deletePost: deletePost,
    postFavorPost: postFavorPost,
    postUnfavorPost: postUnfavorPost,
    postToggleFavorPost: postToggleFavorPost,
    postTextImpression: postTextImpression,
    createImpressionAfterImageUpload: createImpressionAfterImageUpload,
    createImpressionAfterVideoUpload: createImpressionAfterVideoUpload,
    createImpressionAfterAudioUpload: createImpressionAfterAudioUpload
};

function postTextImpression(request, reply) {
    var userId = request.basicSenecaPattern.requesting_user_id;
    request.basicSenecaPattern.cmd = 'addTextImpression';
    request.basicSenecaPattern.type = 'text';
    var senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        postId: request.params.postId,
        userId: userId,
        text: request.payload.data
    }, basicPin);
    request.server.pact(senecaAct)
        .then(reply)
        .then(function() {
            //push notification
        })
        .catch(function(error) {
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
    Wreck.read(res, { json: true }, function(err, response) {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from ms-fileserve');
            return reply(boom.badRequest());
        }
        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }
        var pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'addimpression';
        pattern.type = type;
        var message = {
            postId: request.params.postId,
            text: response.post.text,
            userId: util.getUserId(request.auth),
            file: {
                id: response._id,
                name: response.filename
            }
        };
        var senecaAct = util.setupSenecaPattern(pattern, message, basicPin);
        request.server.pact(senecaAct)
            .then(helper.unwrap)
            .then(function(res) {
                reply(res);
                if (res.isBoom) {
                    // remove the uploaded image again by making an internal DELETE request
                    Wreck.delete('http://localhost:3453/file/' + response._id, function(err) {
                        if (err) {
                            log.error(err, 'Error Deleting file type ' + type, { id: response._id });
                        }
                    });
                } else {
                    // dont send push if not defined
                    if (!message.userId || !message.postId) {
                        return;
                    }
                }
            })
            .catch(function(error) { return reply(boom.badImplementation(error)); });
    });
}

function createGeoTagAfterImageUpload(err, res, request, reply) {
    if (err) {
        log.fatal(err, 'Got error after image upload for location');
        return reply(boom.badRequest());
    }
    // read response
    Wreck.read(res, { json: true }, function(err, response) {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from ms-fileserve');
            return reply(boom.badRequest());
        }
        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }
        var pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'newGeoPost';
        var post = {
            userId: request.basicSenecaPattern.requesting_user_id,
            text: response.post.text,
            postType: response.post.postType,
            bookmarks: request.bookmark,
            geomap: {
                type: 'Point',
                coordinates: [response.location.long, response.location.lat],
                city: {
                    title: 'unknown',
                    placeId: 'unknown'
                }
            },
            photos: [{
                name: response.images.name,
                path: '/api/v2/posts/image/',
                xlarge: response.images.xlarge,
                large: response.images.large,
                normal: response.images.normal,
                small: response.images.small
            }],
            withFriends: response.post.withFriends,
            access: response.post.access,
            shares: [],
            likes: []
        };
        var postId;
        var userId;
        google.findNameOfPosition2(response.location.long, response.location.lat)
            .then(function(cParam) {
                post.geomap.city.title = cParam.title;
                post.geomap.city.placeId = cParam.placeId;
                return post;
            })
            .catch(function(error) {
                log.warn(error);
                return location;
            })
            .then(function(post) {
                var senecaAct = util.setupSenecaPattern(pattern, post, basicPin);
                return request.server.pact(senecaAct);
            })
            .then(helper.unwrap)
            .then(function(post) {
                // reply to client (could be an error)
                reply(post);
                if (!post.isBoom) {
                    postId = post.id;
                    userId = post.userId;
                }
            })
            .catch(function(error) { return reply(boom.badImplementation(error)); });
        //.then(() => {
        // dont send push if not defined
        //    if (!userId || !locationId) {
        //        return;
        //    }
        // send push notifications
        //})
        //.catch(err => log.warn({error: err}, 'Error sending push'));
    });
}

function
postText(request, reply) {
    var userId = request.basicSenecaPattern.requesting_user_id;
    request.basicSenecaPattern.cmd = 'newTextPost';
    var pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'newTextPost';
    var post = {
        userId: request.basicSenecaPattern.requesting_user_id,
        text: request.payload.text,
        postType: postModel.postType[postModel.postType.text],
        withFriends: request.payload.withFriends ? request.payload.withFriends : [],
        access: request.payload.access ? request.payload.access : postModel.accessType[postModel.accessType.public],
        shares: [],
        likes: []
    };
    if (request.payload.clientId) {
        redisClient.get(request.payload.clientId, function(rediserror, redisReply) {
            if (redisReply) {
                var files = JSON.parse(redisReply);
                post.photos = files.images;
                post.fileUrl = files.videos;
                post.postType = postModel.postType[postModel.postType.file];
                pattern.cmd = 'newFilePost';
            }
            redisClient.del(request.payload.clientId);
            postToService(request, pattern, post, reply);
        });
    } else {
        postToService(request, pattern, post, reply);
    }
}

function postToService(request, pattern, post, reply) {
    var senecaAct = util.setupSenecaPattern(pattern, post, basicPin);
    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(function(res) {
            reply(res);
            if (res.isBoom) {
                post.photos.forEach(function(photo) {
                    [photo.xlarge, photo.large, photo.normal, photo.small].forEach(function(_id) {
                        Wreck.delete(proxyUri + '/file/' + _id, function(err) {
                            if (err) {
                                log.error(err, 'Error Deleting file type ' + post.postType, { id: reply._id });
                            }
                        });
                    });
                });
            }
        })
        .catch(function(error) { return reply(boom.badImplementation(error)); });
}

function createTempImageLoc(err, res, request, reply) {
    if (err) {
        log.fatal(err, 'Got error after image upload for post');
        return reply(boom.badRequest());
    }
    // read response
    Wreck.read(res, { json: true }, function(err, response) {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from karmasoc-mediaserve');
            return reply(boom.badRequest());
        }
        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }
        var fileLoc;
        if (response.images)
            fileLoc = {
                ext: response.images.ext,
                xlarge: response.images.xlarge,
                large: response.images.large,
                normal: response.images.normal,
                small: response.images.small
            };
        else {
            fileLoc = {
                id: response.filename,
                ext: response.ext,
                thumbnail: response.thumbnail
            };
        }
        redisClient.get(response.payload.clientId, function(rediserror, redisResp) {
            if (rediserror) {
                reply(boom.create(500, rediserror.message, rediserror));
            } else if (redisResp) {
                var rep = JSON.parse(redisResp);
                if (response.images) {
                    rep.images = rep.images.concat([fileLoc]);
                } else {
                    rep.videos = rep.videos.concat([fileLoc]);
                }
                redisClient.set(response.payload.clientId, JSON.stringify(rep));
                reply(response.images ? fileLoc : fileLoc.thumbnail);
            } else {
                var files = {
                    images: [],
                    videos: []
                };
                if (response.images) {
                    files.images = files.images.concat([fileLoc]);
                } else {
                    files.videos = files.videos.concat([fileLoc]);
                }
                redisClient.set(response.payload.clientId, JSON.stringify(files));
                reply(response.images ? fileLoc : fileLoc.thumbnail);
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
function createPostAfterVideoUpload(err, res, request, reply) {
    genericFileResponseHandler(err, res, request, reply, 'video');
}

function genericFileResponseHandler(err, res, request, reply, type) {
    if (err) {
        log.fatal(err, 'Got error after image upload for location');
        return reply(boom.badRequest());
    }
    // read response
    Wreck.read(res, { json: true }, function(err, response) {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from karmasoc-mediaserve');
            return reply(boom.badRequest());
        }
        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }
        var pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'newVideoPost';
        var post = {
            userId: request.basicSenecaPattern.requesting_user_id,
            text: response.post.text,
            // postType: postModel.postType[postModel.postType.video],
            bookmarks: request.bookmark,
            withFriends: response.post.withFriends,
            access: response.post.access ? response.post.access : postModel.accessType[postModel.accessType.public],
            shares: [],
            likes: []
        };
        var senecaAct = util.setupSenecaPattern(pattern, post, basicPin);
        request.server.pact(senecaAct)
            .then(helper.unwrap)
            .then(function(res) {
                reply(res);
                if (res.isBoom) {
                    // remove the uploaded image again by making an internal DELETE request
                    Wreck.delete(proxyUri + '/file/' + response._id, function(err) {
                        if (err) {
                            log.error(err, 'Error Deleting file type ' + type, { id: response._id });
                        }
                    });
                } else {}
            })
            .catch(function(error) { return reply(boom.badImplementation(error)); });
    });
}

function deletePost(request, reply) {
    request.basicSenecaPattern.cmd = 'deletePost';
    var senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.query, basicPin);
    request.server.pact(senecaAct)
        .then(reply)
        .catch(function(error) {
            reply(boom.badRequest(error));
        });
    //TODO remove media files for the post. remove all impressions for the post..
}

function postToggleFavorPost(request, reply) {
    var pushPattern = util.clone(request.basicSenecaPattern);
    request.basicSenecaPattern.cmd = 'toggleFavor';
    var userId = request.basicSenecaPattern.requesting_user_id;
    var senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        location_id: request.params.locationId,
        user_id: userId
    }, basicPin);
    request.server.pact(senecaAct)
        .then(function(response) {
            reply(response);
            return response;
        })
        .then(function(response) {
            if (response.added) {}
        })
        .catch(function(error) {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
}

function postFavorPost(request, reply) {
    var pushPattern = util.clone(request.basicSenecaPattern);
    request.basicSenecaPattern.cmd = 'favor';
    genericUnFavorPost(request, reply)
        .then(function() {
            //notifyUserForNewLike(pushPattern, request)
        })
        .catch(function(err) { return log.warn('error happend', err); });
}

function postUnfavorPost(request, reply) {
    request.basicSenecaPattern.cmd = 'unfavor';
    genericUnFavorPost(request, reply);
}

function genericUnFavorPost(request, reply) {
    var userId = request.basicSenecaPattern.requesting_user_id;
    var senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        postId: request.params.postId,
        userId: userId,
        like: request.params.like
    }, basicPin);
    return request.server.pact(senecaAct)
        .then(reply)
        .catch(function(error) {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
}

//# sourceMappingURL=postController.js.map