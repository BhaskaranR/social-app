
'use strict';
import * as admin from "firebase-admin";
import * as Hapi from "hapi";
import * as util from '../util/util';

import { unwrap } from '../util/responseHelper';
import { ThumboUrl } from '../util/thumbor/thumborUrlBuilder';
import DeviceController from './deviceController';
const Glue = require('glue');
const boom = require('boom');
const Wreck = require('wreck');
const fb = require('fbgraph');
const log = require('karmasoc-util').logger;
const slack = require('karmasoc-util').slack;

const uuidv4 = require('uuid/v4');
//const serviceAccount = require("../../karmasoc-firebase-adminsdk.json");
const config = require('config');
const JWT = require('jsonwebtoken');   // used to sign our content

// if you don't already have a *FREE* RedisCloud Account
// visit: https://addons.heroku.com/rediscloud (it works outside heroku! free!)
const redisClient = require('../session/session')(); // instantiate redis-connection
const basicPin = {
    role: 'user'
};

const mailerPin = {
    role: 'mailer'
}
const vapidkeyDetails = "BEMHvDSNah5TnwfBzY5kZc8l4ax7fmLaoHg9lP8eDJ7wdJldEFoRg3TC46-oiyUKg3R9gms-zNY5BbNsotPC2VE";

export default class UserController {
    static firebaseAdmin;
    /*static initialize() {
     
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://karmasoc-148700.firebaseio.com"
        });
    }
    */

    static protected = (request, reply) => {
        UserController.getUserById(request, reply, true);
    }


    static login(request, reply) {
        // change this to strongly typed todo
        log.info('Login requested');
        let pattern = util.clone(request.basicSenecaPattern);
        let user = request.payload;
        //device registration not required
        if (request.headers["Authorization"]) {
            let userId = pattern.requesting_user_id || request.auth.credentials.id;
            return this.getUserById(request, reply, userId);
        }
        //TODO *******
        /* if (pattern.requesting_device_id === 'unknown') {
            return reply(boom.preconditionFailed('Register your device!'));
        } else {
            user.requesting_device_id = pattern.requesting_device_id;
        } */
        log.info('Login request sent to user service');
        var uid = uuidv4();
        var additionalClaims = {
            premiumAccount: true
        };

        pattern.cmd = 'login';
        let senecaAct = util.setupSenecaPattern(pattern, user, basicPin);
        request.server.pact(senecaAct)
            .then(result => {

                let resp = unwrap(result);
                resp.vapidKey = vapidkeyDetails;

                log.info('Got Response from user service & firebase');

                var ecommerceUri = "http://ec2-34-227-65-121.compute-1.amazonaws.com/index.php/rest/default/V1/integration/customer/token";
                var options = {
                    payload: JSON.stringify({ "username": request.payload.mail, "password": request.payload.password }),
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                };
                var optionalCallback = function (err, res) {
                    if (err) {
                        console.log(err.message);
                    }
                    if (res.statusCode !== 200) {
                        console.log("error");
                    }
                    Wreck.read(res, null, function (err, body) {
                        /* do stuff */
                        var admin_ecommerceUri = "http://ec2-34-227-65-121.compute-1.amazonaws.com/index.php/rest/default/V1/integration/admin/token";
                        var admin_options = {
                            payload: JSON.stringify({ "username": 'admin', "password": 'chandra@1' }),
                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                        };

                        Wreck.post(admin_ecommerceUri, admin_options, function (admin_error, admin_response, admin_payload) {
                            //console.log(admin_payload.toString());
                            //console.log(body.toString());
                            if (!resp.isBoom) {
                                let session = {
                                    _id: uuidv4(),
                                    user_id: resp._id,
                                    mail: resp.mail,
                                    firstName: resp.firstName,
                                    lastName: resp.lastName,
                                    vapidKey: vapidkeyDetails,
                                    commerce_customer_id: body.toString(),
                                    commerce_admin_id: admin_payload.toString()
                                };
                                console.log(session);
                                log.info('create token');
                                var token = JWT.sign(session, config.get("jwtSecret"));
                                log.info('set the sesion in redis');
                                // create the session in Redis
                                redisClient.set(session._id, JSON.stringify(session), (err: Error, response: string) => {
                                    if (err) {
                                        boom.badImplementation(err);
                                    }
                                    log.info('session response received from redis thanks', token);
                                    return reply(resp).
                                        header("Authorization", token);
                                });
                                // sign the session as a JWT
                            }
                            else {
                                reply(resp)
                            }

                        });
                    });
                };
                var req = Wreck.request("POST", ecommerceUri, options, optionalCallback);
            })
            .catch(error => {                 //TODO fix boom errors properly
                reply(error)
            });
    }

   /* static googleplusurl(request, reply) {
        Glue.compose(manifest, (err, server) => {
            let url = server.generate_google_oauth2_url();
            reply(url);
        });
    }*/

    static facebookurl(request, reply) {
        let authUrl = fb.getOauthUrl({
            client_id: config.get("auth.facebook.clientID"),
            redirect_uri: config.get("auth.facebook.redirect_uri")
        });
        reply(authUrl);
    }

    /*static googlelogin(request, reply, tokens, profile) {
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'smLogin';
      
        log.info(JSON.stringify(profile));
        let profiledata = {
            "firstName": profile.name.givenName,
            "lastName": profile.name.familyName,
            "mail": profile.emails[0].value,
            "id": profile.id,
            "strategy": 'google',
            "requesting_device_id": pattern.requesting_device_id
        };
        let senecaAct = util.setupSenecaPattern(pattern, profiledata, basicPin);
        request.server.pact(senecaAct)
            .then(unwrap)
            .then(resp => {
                if (!resp.isBoom) {
                    let session = {
                        _id: resp._id,
                        mail: resp.mail,
                        firstname: resp.firstName,
                        lastname: resp.lastName,
                        strategy: 'google',
                        device_id: resp.requesting_device_id
                    };
                    // create the session in Redis
                    redisClient.set(session._id, JSON.stringify(session));
                    // sign the session as a JWT
                    var token = JWT.sign(session, config.get("jwtSecret")); // synchronous
                    return reply(session).
                        state("_id", resp._id, { encoding: 'none' })
                        .state("smAuthToken", token)
                        .redirect(config.get("env.host.karmasoc-web") + ":" + config.get("env.port.karmasoc-web"));
                }
                return reply(resp.output).
                    state("error", resp.output.statusCode + "", { encoding: 'none' })
                    .redirect(config.get("env.host.karmasoc-web") + ":" + config.get("env.port.karmasoc-web"));
            })
            .catch(error => reply(boom.badImplementation(error)));
    }
    */

    static fbLogin(request, reply) {
        if (request.query.code) {
            fb.authorize({
                "client_id": config.get("auth.facebook.clientID"),
                "redirect_uri": config.get("auth.facebook.redirect_uri"),
                "client_secret": config.get("auth.facebook.clientSecret"),
                "code": request.query.code
            }, function (err, facebookRes) {
                console.log(err);
                let pattern = util.clone(request.basicSenecaPattern);
                pattern.cmd = 'smLogin';
                if (request.headers["Authorization"]) {
                    let userId = request.auth.credentials.id || pattern.requesting_user_id;
                    return this.getUserById(request, reply, userId);
                }
                fb.get('/me?fields=id,email,first_name,last_name', (err, fb_user) => {
                    log.info(JSON.stringify(fb_user));
                    fb_user.requesting_device_id = pattern.requesting_device_id;
                    let profiledata = {
                        "firstName": fb_user.first_name,
                        "lastName": fb_user.last_name,
                        "mail": fb_user.email,
                        "id": fb_user.id,
                        "strategy": "facebook"
                    };
                    let senecaAct = util.setupSenecaPattern(pattern, profiledata, basicPin);
                    request.server.pact(senecaAct)
                        .then(unwrap)
                        .then(resp => {
                            if (!resp.isBoom) {
                                let session = {
                                    _id: resp._id,
                                    mail: resp.mail || resp.fbId,
                                    firstname: resp.firstName,
                                    lastname: resp.lastName,
                                    strategy: 'facebook',
                                    device_id: resp.requesting_device_id
                                };
                                // create the session in Redis
                                redisClient.set(session._id, JSON.stringify(session), function (err, reply) {
                                    console.log(err);
                                    console.log(reply);
                                });
                                // sign the session as a JWT
                                var token = JWT.sign(session, config.get("jwtSecret")); // synchronous
                                return reply(session).
                                    state("_id", resp._id, { encoding: 'none', path: '/' })
                                    .state("smAuthToken", token)
                                    .redirect(config.get("env.host.karmasoc-web") + ":" + config.get("env.port.karmasoc-web"));
                            }
                            return reply(resp.output).
                                state("error", resp.output.statusCode + "", { encoding: 'none', path: '/' })
                                .redirect(config.get("env.host.karmasoc-web") + ":" + config.get("env.port.karmasoc-web"));
                        })
                        .catch(error => reply(boom.badImplementation(error)));
                });
            });
        }
    }

    static logout(request, reply) {
        let sessionId = request.basicSenecaPattern.requesting_session_id;
        var session;
        redisClient.get(sessionId, (rediserror, redisreply) => {
            if (rediserror) {
                console.log(rediserror);
            }
            session = JSON.parse(redisreply)
            console.log(' - - - - - - SESSION - - - - - - - -')
            console.log(session);
            // update the session to no longer valid:
            session.valid = false;
            session.ended = new Date().getTime();
            // create the session in Redis
            redisClient.set(session._id, JSON.stringify(session));
            reply({ message: 'You are logged out' });
        });
    }


    static register(request, reply) {
        if (request.headers["Authorization"]) {
            log.warn('Already authenticated user wants to register', { userid: request.auth.credentials.id });
            return reply({ message: 'Dude, you are already registered and authenticated!' });
        }

        let pattern = util.clone(request.basicSenecaPattern);
        let user = request.payload;
        // if (!(pattern.requesting_device_id === 'unknown')) {
        user.requesting_device_id = pattern.requesting_device_id;
        // }
        pattern.cmd = 'register';
        pattern.entity = 'user';
        let senecaAct = util.setupSenecaPattern(pattern, user, basicPin);
        request.server.pact(senecaAct)
            .then(unwrap)
            .then(result => {
                if (!result.isBoom) {
                    let session = {
                        _id: result._id,
                        mail: result.mail,
                        firstname: result.firstName,
                        lastname: result.lastName,
                        device_id: user.requesting_device_id
                    };
                    // sign the session as a JWT
                    var token = JWT.sign(session, config.get("jwtSecret")); // synchronous

                    var id = uuidv4();
                    redisClient.set(id, token);

                    reply({ ok: true, message: "Reset email has been sent to your inbox" });

                    /**
                     * send verification email after successful registration
                     */
                    let pattern = util.clone(request.basicSenecaPattern);
                    pattern.cmd = 'send';
                    pattern.subject = 'confirmMail';
                    let data = { token: id, name: session.firstname + " " + session.lastname, userid: session.mail };
                    let senecaAct = util.setupSenecaPattern(pattern, data, mailerPin);

                    request.server.pact(senecaAct)
                        .catch(err => log.fatal('Error sending Mail', { error: err }));
                    /* reply(result)
                    .header("Authorization", token);
                    */
                    //      reply(result).code(201).unstate('locator');

                    slack.sendSlackInfo(process.env['SLACK'], 'new user registered ' + result.name);
                } else {
                    return reply(result);
                }
            })
            .catch(error => {
                reply(boom.badImplementation(error))
            });
    }


    static confirmEmail(request, reply) {
        let pattern = util.clone(request.basicSenecaPattern);
        let userId = request.basicSenecaPattern.requesting_user_id;
        pattern.cmd = 'confirmemail';
        pattern.entity = 'user';
        redisClient.get(request.params.userId, function (err, resp) {
            if (err) {
                reply(boom.badImplementation(err))

            }
            JWT.verify(resp, config.get("jwtSecret"), function (err, decoded) {
                let data = {
                    id: decoded._id
                };
                let senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
                request.server.pact(senecaAct)
                    .then(unwrap)
                    .then(reply)
                    .catch(error => reply(boom.badImplementation(error)));

            });
            redisClient.del(request.params.userId, (err, resp) => {
                if (resp == 1) {
                    log.info('Deleted  Successfully');
                } else {
                    log.info('Cannot   Delete');
                }
            })
            var token = reply;
        });

    }


    static changePwd(request, reply) {
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'changePwd';
        if (request.auth.credentials.strategy === 'facebook') {
            return reply(boom.badRequest('unable to change facebook pw'));
        }
        let message = request.payload;
        message.user_id = request.basicSenecaPattern.requesting_user_id;

        let senecaAct = util.setupSenecaPattern(pattern, message, basicPin);
        request.server.pact(senecaAct)
            .then(unwrap)
            .then(reply)
            .catch(error => reply(boom.badImplementation(error)));
    }

    static forgetPassword(request, reply) {

        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'forgetPassword';

        let mailPattern = util.clone(request.basicSenecaPattern);
        mailPattern.cmd = 'send';
        mailPattern.subject = 'pwforget';

        let user = {
            mail: request.payload.mail
        };

        let senecaAct = util.setupSenecaPattern(pattern, user, basicPin);
        request.server.pact(senecaAct)
            .then(unwrap)
            .then(value => {

                if (!value.isBoom) {
                    // reply to client
                    reply({ ok: true, message: "Reset email has been sent to your inbox" });

                    // send mail to user
                    let senecaMailAct = util.setupSenecaPattern(
                        mailPattern,
                        {
                            mail: user.mail,
                            new_password: value.new_password
                        },
                        {
                            role: 'mailer'
                        });

                    request.server.pact(senecaMailAct)
                        .catch(err => log.fatal('Error sending Mail', { error: err }));

                } else {
                    reply(value);
                }

            })
            .catch(error => reply(boom.badImplementation(error)));
    }

    static follow = (request, reply) => {

        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'follow';

        let senecaAct = util.setupSenecaPattern(pattern, {
            follow_id: request.params.follow_id,
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

    static unfollow = (request, reply) => {
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'unfollow';

        let senecaAct = util.setupSenecaPattern(pattern, {
            follow_id: request.params.follow_id,
            user_id: pattern.requesting_user_id
        }, basicPin);

        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));

    };

    static getFollowingUsersByUserId = (request, reply, userId) => {

        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'getfollowing';

        let senecaAct = util.setupSenecaPattern(pattern, {
            user_id: userId
        }, basicPin);

        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static getMyFollowing = (request, reply) => {
        UserController.getFollowingUsersByUserId(request, reply, request.basicSenecaPattern.requesting_user_id);
    };

    static getFollowingByUserId = (request, reply) => {
        UserController.getFollowingUsersByUserId(request, reply, request.params.userId);
    };


    static getFollowerByUserId = (request, reply, userId) => {
        request.basicSenecaPattern.cmd = 'getfollowers';

        let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
            user_id: userId || request.requestingUserId
        }, basicPin);

        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static getMyFollower = (request, reply) => {

        UserController.getFollowerByUserId(request, reply, request.basicSenecaPattern.requesting_user_id);

    };
    static getFollowerByUser = (request, reply) => {
        UserController.getFollowerByUserId(request, reply, request.params.userId);
    };


    static getUserById(request, reply, useRequestingUser) {
        let options: any = {};
        let userId = request.params.userId;
        let basicPost;
        let basicFollower;
        let basicBusiness;
        let senecaActPostCount;
        let senecaActFollowerCount;
        let deviceId = request.basicSenecaPattern.requesting_device_id
        let basicUser = util.clone(request.basicSenecaPattern);

        if (request.query.count) {
            options.countFollowers = request.query.count.includes('followers');
            options.countPosts = request.query.count.includes('posts');
            options.getbiz = request.query.count.includes('biz');
        }

        if (useRequestingUser) {
            userId = request.basicSenecaPattern.requesting_user_id;
        }

        if (!userId || userId === 'unknown') {
            return reply(boom.badRequest('No user id found in cookie (or param)'));
        }

        let postCountPromise = true;
        let followersCountPromise = true;
        let businessPromise = true;

        basicUser.cmd = 'getUser';
        basicUser.by = 'id';

        let senecaActUser = util.setupSenecaPattern(basicUser, {
            user_id: userId
        }, basicPin);

        if (options.countPosts) {
            basicPost = util.clone(request.basicSenecaPattern);

            basicPost.cmd = 'count';
            basicPost.entity = 'post';
            basicPost.by = 'userId';

            senecaActPostCount = util.setupSenecaPattern(basicPost, {
                user_id: userId
            }, { role: 'posts' });

            // override bool with promise
            postCountPromise = request.server.pact(senecaActPostCount);
        }

        if (options.countFollowers) {
            basicFollower = util.clone(request.basicSenecaPattern);

            basicFollower.cmd = 'count';
            basicFollower.entity = 'follower';
            basicFollower.by = 'userId';

            senecaActFollowerCount = util.setupSenecaPattern(basicFollower, {
                user_id: userId
            }, basicPin);

            // override bool with promise
            followersCountPromise = request.server.pact(senecaActFollowerCount);
        }

        if (options.getbiz) {
            basicBusiness = util.clone(request.basicSenecaPattern);
            basicBusiness.cmd = 'getbizbyuserid';
            let senecaActBiz = util.setupSenecaPattern(basicBusiness, {
                user_id: userId
            }, {
                    role: 'business'
                });

            businessPromise = request.server.pact(senecaActBiz)
        }

        Promise.all([request.server.pact(senecaActUser), postCountPromise, followersCountPromise, businessPromise])
            .then(result => {
                let user = unwrap(result[0]);

                if (!user.isBoom) {
                    if (options.countPosts) {
                        user.postsCount = result[1]["count"] || 0;
                    }
                    if (options.countFollowers) {
                        user.followersCount = result[2]["count"] || 0;
                    }
                }
                let userbiz = unwrap(result[3]);
                if (userbiz) {
                    user.mybusinesses = userbiz;
                }

                // HACK: add default user images
                if (!user.images || !user.images.normal || !user.images.small) {
                    user.images = {
                        normal: '',
                        small: '',
                        large: ''
                    };
                }

                if (!user.backgroundImage || !user.backgroundImage.normal || !user.backgroundImage.small) {
                    user.backgroundImage = {
                        normal: '',
                        small: '',
                        large: ''
                    };
                }

                return reply(user);
            })
            .catch(error => {
                reply(boom.badImplementation(error))
            });
    }


    static userImageUploadResponse(err, res, request, reply) {
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
            if (request.path === "/users/bgimage") {
                pattern.entity = 'bgimage';
                message.bgimages = {
                    small: ThumboUrl.smallPhoto(response.file.key),
                    normal: ThumboUrl.normalPhoto(response.file.key),
                    large: ThumboUrl.largePhoto(response.file.key),
                    verylarge: ThumboUrl.verylargePhoto(response.file.key)
                };
            }
            else {
                pattern.entity = 'image';
                message.images = {
                    normal: ThumboUrl.smallAvatarImage(response.file.key),
                    small: ThumboUrl.largeAvatarImage(response.file.key)
                };
            }
            let senecaAct = util.setupSenecaPattern(pattern, message, basicPin);
            request.server.pact(senecaAct)
                .then(unwrap)
                .then(res => {
                    reply(res);
                    if (res.isBoom) {
                        // remove the uploaded image again by making an internal DELETE request
                        Wreck.delete(config.get("env.host.karmasoc-mediaserve") +
                            config.get('env.port.karmasoc-mediaserve') + '/file/' + response.id, (err) => {
                                if (err) {
                                    log.error(err, 'Error Deleting file type ', { id: response.id });
                                }
                            });
                    }
                })
                .catch(error => reply(boom.badImplementation(error)));
        });
    }

    static userRegisterImageUploadRespone(err, res, request, reply) {
        reply(boom.notImplemented('Wait for it'));
    }


    static getSettings = (request, reply) => {
        UserController.getSettingsByUserId(request, reply,
            request.basicSenecaPattern.requesting_user_id /*"57afd9d64e35a7000526b63b"*/);
    };

    static getSettingsByUserId = (request, reply, userId) => {

        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'getSettings';

        let senecaAct = util.setupSenecaPattern(pattern, {
            user_id: userId
        }, basicPin);

        request.server.pact(senecaAct)
            .then(res =>
                reply(unwrap(res)))
            .catch(error =>
                reply(boom.badImplementation(error)));
    };

    static updateSettings = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            settings: request.payload.settings
        };
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updateSettings';
        let senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badsImplementation(error)));
    };

    static updatePersonalInfo = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            personalInfo: request.payload
        };
        const pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updatePersonalInfo';
        const senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static updatePersonalContact = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            personalInfo: request.payload
        };
        const pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updatePersonalContact';
        const senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static updateUserCustomUrl = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            customUrls: request.payload
        };
        const pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updateCustomUrls';
        const senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static updateUserPlacesHistory = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            placesHistory: request.payload
        }

        const pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updateUserPlacesHistory';
        const senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static updateUserEducationHistory = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            educationHistory: request.payload.educationHistory,
            visibility: request.payload.visibility
        };
        const pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updateUserEducationHistory';
        const senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static updateUserWorkHistory = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            workHistory: request.payload.workHistory,
            visibility: request.payload.visibility
        }
        const pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updateUserWorkHistory';
        const senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static updateUserStory = (request, reply) => {
        const data = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            story: request.payload
        };
        const pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'updateUserStory';
        const senecaAct = util.setupSenecaPattern(pattern, data, basicPin);
        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };

    static getAllUsers = (request, reply) => {
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'getAllUserExceptMe';

        let senecaAct = util.setupSenecaPattern(pattern,
            {
                userId: request.basicSenecaPattern.requesting_user_id
            }, basicPin);

        request.server.pact(senecaAct)
            .then(res => reply(unwrap(res)))
            .catch(error => reply(boom.badImplementation(error)));
    };
}
