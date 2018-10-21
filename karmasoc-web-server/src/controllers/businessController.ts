'use strict';
import * as boom from 'boom';
import { Business } from '../model/business';
let Wreck = require('wreck');


const util = require('../util/util');
const helper = require('../util/responseHelper');
const google = require('../util/googleutil');

const utilities = require('karmasoc-util');
const log = utilities.logger;
const slack = utilities.slack;
import { unwrap } from '../util/responseHelper';
var config = require('config');

const basicPin = {
    role: 'business'
};


module.exports = {
    getBizByUserId,
    getBizScreen,
    notifyUserForNewLike,
    getBizById,
    getBizNearby,
    createBizAfterImageUpload,
    deleteBiz,
    postGeoBiz,
    getGeoBizNearby,
    getFavoriteBizByUserId,
    getMyFavoriteBiz,
    postToggleFavorBiz,
    postFavorBiz,
    postUnfavorBiz,
    getPlacesByName,
    postUpdateBiz,
    getBizLookup,
    getSubcategories,
    bizImageUploadResponse,
    getSuggestedBiz,
    getFollowingBizOfUser,
    follow,
    unfollow,
    getFollowingByBizId,
    getFollowerByBiz,
    createBiz,
    mybiz
};

function mybiz(request, reply) {
    getBizByUserId(request, reply, true);
}


function getSuggestedBiz(request, reply) {
    request.basicSenecaPattern.cmd = 'getsuggestedbiz';
    let userId = request.basicSenecaPattern.requesting_user_id;

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => {
            reply(boom.badRequest(error));
        });
}


function getFollowingBizOfUser(request, reply) {
    request.basicSenecaPattern.cmd = 'getfollowingbizofuser';
    let userId = request.basicSenecaPattern.requesting_user_id;
    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => {
            reply(boom.badRequest(error));
        });
}



function getBizByUserId(request, reply, useRequestingUser) {
    let options: any = {};
    let userId = request.params.userId;

    let basicUser = util.clone(request.basicSenecaPattern);
    if (useRequestingUser) {
        userId = request.basicSenecaPattern.requesting_user_id;
    }

    if (!userId || userId === 'unknown') {
        return reply(boom.badRequest('No user id found in cookie (or param)'));
    }

    basicUser.cmd = 'getbizbyuserid';
    let senecaActBiz = util.setupSenecaPattern(basicUser, {
        user_id: userId
    }, basicPin);

    Promise.all([request.server.pact(senecaActBiz)])
        .then(result => {
            let bizs = unwrap(result[0]);

            return reply(bizs);
        })
        .catch(error => reply(boom.badImplementation(error)));
}


function bizImageUploadResponse(err, res, request, reply) {
    if (err) {
        log.fatal(err, 'Got error after image upload for location');
        return reply(boom.badRequest());
    }

    // read response
    Wreck.read(res, { json: true }, (err, response) => {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from karmasoc-fileserve');
            return reply(boom.badRequest());
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }

        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'add';
        pattern.entity = 'image';
        let message: any = { user_id: util.getUserId(request.auth) };

        if (request.path == "/biz/bgimage") {

            pattern.entity = 'bgimage';
            message.bgimages = {
                normal: response.images.normal + response.name.substring(response.name.indexOf(".")),
                small: response.images.small + response.name.substring(response.name.indexOf("."))
            };

        }
        else {
            pattern.entity = 'image';
            message.images = {
                normal: response.images.normal + response.name.substring(response.name.indexOf(".")),
                small: response.images.small + response.name.substring(response.name.indexOf("."))
            };
        }

        let senecaAct = util.setupSenecaPattern(pattern, message, basicPin);
        request.server.pact(senecaAct)
            .then(unwrap)
            .then(res => {

                reply(res);
                if (res.isBoom) {
                    // remove the uploaded image again by making an internal DELETE request
                    Wreck.delete(config.get("env.host.karmasoc-mediaserve") + config.get('env.port.karmasoc-mediaserve') + '/file/' + response.id, (err) => {
                        if (err) {
                            log.error(err, 'Error Deleting file type ', { id: response.id });
                        }
                    });
                }
            })
            .catch(error => reply(boom.badImplementation(error)));
    });
}

function follow(request, reply) {

    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'follow';

    let senecaAct = util.setupSenecaPattern(pattern, {
        biz_id: request.params.follow_id,
        user_id: pattern.requesting_user_id
    }, basicPin);

    request.server.pact(senecaAct)
        .then(res => reply(unwrap(res)))
        .catch(error => reply(boom.badImplementation(error)));

    let notificationAct = util.clone(senecaAct);
    notificationAct.cmd = 'notify';
    notificationAct.role = 'notifications';
    notificationAct.entity = 'newFollower';

    request.server.pact(notificationAct)
        .catch(error => log.error('Error sending push', { err: error }));

};

function unfollow(request, reply) {
    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'unfollow';

    let senecaAct = util.setupSenecaPattern(pattern, {
        biz_id: request.params.follow_id,
        user_id: pattern.requesting_user_id
    }, basicPin);

    request.server.pact(senecaAct)
        .then(res => reply(unwrap(res)))
        .catch(error => reply(boom.badImplementation(error)));

};

function getFollowingByBizId(request, reply, userId) {

    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'getfollowing';

    let senecaAct = util.setupSenecaPattern(pattern, {
        business_id: request.params.bizId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(res => reply(unwrap(res)))
        .catch(error => reply(boom.badImplementation(error)));
};

function getFollowerByBiz(request, reply, userId) {
    request.basicSenecaPattern.cmd = 'getfollowers';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        business_id: request.params.bizId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(res => reply(unwrap(res)))
        .catch(error => reply(boom.badImplementation(error)));
};

function getBizScreen(request, reply) {
    let senecaActBiz = {
        cmd: 'nearby',
        data: {
            long: request.query.long || 40.7283235,
            lat: request.query.lat || -74.0351536,
            maxDistance: request.query.maxDistance || 30000,
            limit: request.query.limit || 6
        },
        role: 'business'
    };

    request.server.pact(senecaActBiz)
        .then(helper.unwrap)
        .then(data => reply({ locations: data }).ttl(30000))
        .catch(reply);
}

function notifyUserForNewLike(pushPattern, request) {
    pushPattern.cmd = 'notify';
    pushPattern.entity = 'business';
    pushPattern.action = 'newFavorator';

    let senecaAct = util.setupSenecaPattern(pushPattern, {
        loc_id: request.params.bizId,
        favorator_id: request.basicSenecaPattern.requesting_user_id
    }, { role: 'notifications' });
    return request.server.pact(senecaAct);
}

function getBizById(request, reply) {
    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'bizById';

    let senecaAct = util.setupSenecaPattern(pattern, request.params, basicPin);
    let basicUser = util.clone(request.basicSenecaPattern);
    basicUser.cmd = 'getUserInfo';

    var data: any = {
        requesting_user_id: request.basicSenecaPattern.requesting_user_id
    };

    let senecaActUser = util.setupSenecaPattern(basicUser, data , { role: 'user' });
    request.server.pact(senecaAct)
        .then(resp => {
            const biz = helper.unwrap(resp)
            data.userIds = biz.following;
            if(!biz.following) {
                reply(biz);
                return;
            }

            request.server.pact(senecaActUser).then(respUsers => {
                biz.followingUsers = helper.unwrap(respUsers)
                reply(biz);
            });
        })
        .catch(error => reply(boom.badImplementation(error)));
}

function getBizNearby(request, reply) {

    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'nearby';

    let senecaAct = util.setupSenecaPattern(pattern, request.query, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => reply(boom.badImplementation(error)));
}

function createBiz(request, reply) {
    // read response
    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'addnewBiz';

    let biz: Business = {
        userId: request.basicSenecaPattern.requesting_user_id,
        title: request.payload.title,
        businessId: request.payload.businessId,
        categoryId: request.payload.categoryId,
        subcategoryId: request.payload.subcategoryId,
        // phonenumber: request.payload.phonenumber,
        address: request.payload.address,
        zipcode: request.payload.zipcode,
        // story: request.payload.story,
        referredBy: request.payload.referredBy,
        geotag: {
            type: 'Point',
            coordinates: [request.payload.long, request.payload.lat]
        },
        /*images: {
            xlarge: '/api/v2/biz/impression/image/' + response.images.xlarge + '/' + response.images.name,
            large: '/api/v2/biz/impression/image/' + response.images.large + '/' + response.images.name,
            normal: '/api/v2/biz/impression/image/' + response.images.normal + '/' + response.images.name,
            small: '/api/v2/biz/impression/image/' + response.images.small + '/' + response.images.name
        }, 
        city: {
            title: 'Unknown',
            place_id: 'Unknown'
        }*/
    };

    let bizId;
    let userId;

    /*  google.findNameOfPosition2(request.payload.long, request.payload.lat)
          .then(cParam => {
              biz.city.title = cParam.title;
              biz.city.place_id = cParam.place_id;

              return biz;
          })
          .catch(error => {
              log.warn(error);
              return biz;
          })
          .then(bizResp => { 
              let senecaAct = util.setupSenecaPattern(pattern, bizResp, basicPin);

              return request.server.pact(senecaAct);
          })*/
    let senecaAct = util.setupSenecaPattern(pattern, biz, basicPin);
    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(bizResp => {

            // reply to client (could be an error)
            reply(bizResp);

            if (!bizResp.isBoom) {
                bizId = bizResp._id;
                userId = bizResp.user_id;
            }

            slack.sendSlackInfo(process.env['SLACK'], 'New Business Created with Title ' + biz.title +
                ' https://karmasoc.com' + bizResp.images.xlarge);

        })
        .catch(error => reply(boom.badImplementation(error)))
        .then(() => {

            // dont send push if not defined
            if (!userId || !bizId) {
                return;
            }

            // send push notifications
            let pushPattern = util.clone(request.basicSenecaPattern);
            pushPattern.cmd = 'notify';
            pushPattern.entity = 'newBiz';

            let pushAct = util.setupSenecaPattern(pushPattern,
                {
                    location_id: bizId,
                    user_id: userId,
                    user_name: request.auth.credentials.name
                },
                { role: 'notifications' });

            return request.server.pact(pushAct);
        })
        .catch(err => log.warn({ error: err }, 'Error sending push'));

}

function createBizAfterImageUpload(err, res, request, reply) {

    if (err) {
        log.fatal(err, 'Got error after image upload for business');
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
        pattern.cmd = 'addnewBiz';

        let biz: Business = {
            userId: request.basicSenecaPattern.requesting_user_id,
            title: response.biz.title,
            businessId: response.biz.businessId,
            categoryId: response.biz.categoryId,
            subcategoryId: response.biz.subcategoryId,
            phonenumber: response.biz.phonenumber,
            address: response.biz.address,
            zipcode: response.biz.zipcode,
            story: response.biz.story,
            referredBy: request.biz.referredBy,
            geotag: {
                type: 'Point',
                coordinates: [response.biz.long, response.biz.lat]
            },
            images: {
                xlarge: '/api/v2/biz/impression/image/' + response.images.xlarge + '/' + response.images.name,
                large: '/api/v2/biz/impression/image/' + response.images.large + '/' + response.images.name,
                normal: '/api/v2/biz/impression/image/' + response.images.normal + '/' + response.images.name,
                small: '/api/v2/biz/impression/image/' + response.images.small + '/' + response.images.name
            },
            city: {
                title: 'Unknown',
                place_id: 'Unknown'
            }
        };

        let bizId;
        let userId;

        google.findNameOfPosition2(response.biz.long, response.biz.lat)
            .then(cParam => {
                biz.city.title = cParam.title;
                biz.city.place_id = cParam.place_id;

                return biz;
            })
            .catch(error => {
                log.warn(error);
                return biz;
            })
            .then(bizResp => {
                let senecaAct = util.setupSenecaPattern(pattern, bizResp, basicPin);

                return request.server.pact(senecaAct);
            })
            .then(helper.unwrap)
            .then(bizResp => {

                // reply to client (could be an error)
                reply(bizResp);

                if (!bizResp.isBoom) {
                    bizId = bizResp._id;
                    userId = bizResp.user_id;
                }

                slack.sendSlackInfo(process.env['SLACK'], 'New Business Created with Title ' + biz.title +
                    ' https://karmasoc.com' + bizResp.images.xlarge);


            })
            .catch(error => reply(boom.badImplementation(error)))
            .then(() => {

                // dont send push if not defined
                if (!userId || !bizId) {
                    return;
                }

                // send push notifications
                let pushPattern = util.clone(request.basicSenecaPattern);
                pushPattern.cmd = 'notify';
                pushPattern.entity = 'newBiz';

                let pushAct = util.setupSenecaPattern(pushPattern,
                    {
                        location_id: bizId,
                        user_id: userId,
                        user_name: request.auth.credentials.name
                    },
                    { role: 'notifications' });

                return request.server.pact(pushAct);
            })
            .catch(err => log.warn({ error: err }, 'Error sending push'));
    });

}

function deleteBiz(request, reply) {
    request.basicSenecaPattern.cmd = 'deleteBiz';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

}

function getBizLookup(request, reply) {
    request.basicSenecaPattern.cmd = 'getBizLookup';
    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.params, basicPin);
    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => {
            reply(boom.badRequest(error));
        });
}

function getSubcategories(request, reply) {
    request.basicSenecaPattern.cmd = 'getBizSubCategories';
    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.params, basicPin);
    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => {
            reply(boom.badRequest(error));
        });
}


function postGeoBiz(request, reply) {

    let senecaAct = util.setupSenecaPattern('addgeobiz', request.payload, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

}

function getGeoBizNearby(request, reply) {

    let senecaAct = util.setupSenecaPattern('nearbygeobiz', request.query, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => {
            reply(boom.badRequest(error));
        });
}

function getFavoriteBizByUserId(request, reply, optionalUserId) {
    let userId = optionalUserId || request.params.userId;

    let senecaAct = util.setupSenecaPattern('getfavoriteBizbyuserid', {
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });

}

function getMyFavoriteBiz(request, reply) {
    getFavoriteBizByUserId(request, reply, request.basicSenecaPattern.requesting_user_id);
}

function postToggleFavorBiz(request, reply) {
    let pushPattern = util.clone(request.basicSenecaPattern);

    request.basicSenecaPattern.cmd = 'toggleFavor';
    let userId = request.basicSenecaPattern.requesting_user_id;

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        biz_id: request.params.bizId,
        user_id: userId
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

function genericUnFavorBiz(request, reply) {
    let userId = request.basicSenecaPattern.requesting_user_id;

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        biz_id: request.params.bizId,
        user_id: userId
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

function postFavorBiz(request, reply) {
    let pushPattern = util.clone(request.basicSenecaPattern);
    request.basicSenecaPattern.cmd = 'favor';
    genericUnFavorBiz(request, reply)
        .then(() => notifyUserForNewLike(pushPattern, request))
        .catch(err => log.warn('error happend', err));
}

function postUnfavorBiz(request, reply) {
    request.basicSenecaPattern.cmd = 'unfavor';
    genericUnFavorBiz(request, reply);
}

function getPlacesByName(request, reply) {

    let senecaAct;
    let name = request.query.bizName;
    let long = request.query.long;
    let lat = request.query.lat;

   /* if (name && name != "") {
        senecaAct = util.setupSenecaPattern('bizByname', { bizName: request.query.bizName }, basicPin);
    }
    else {
        senecaAct = util.setupSenecaPattern('nearby', request.query, basicPin);
    }
    */

    //let gFinds = google.bizSearch(name, lat, long);
    //let dbPromise = request.server.pact(senecaAct);
    //Promise.all([ dbPromise, gFinds])
     google.bizSearch(name, lat, long)
        .then(value => {
           // let dbBiz = helper.unwrap(value[0]);
            let googleBiz = value;   
            let result = {
                google: googleBiz,
                biz: []
            };

            reply(result);
        })
        .catch(error => {
            reply(boom.badRequest(error));
        });
}

function postUpdateBiz(request, reply) {
    return reply(boom.notImplemented('todo'));
}