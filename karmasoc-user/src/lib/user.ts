import * as Joi from "joi";
import * as _ from "lodash";

import { IDevice, IUser, User } from "./interfaces";

import DeviceRepository from './mongoDevice';
import { InsertOneWriteOpResult } from "mongodb";
import { Db } from './mongo';
import { ObjectID } from "mongodb";
import deviceRepository from "./mongoDevice";
import util from "../util/util";

const validation = require('../validations/validation');
const bcrypt = require('bcrypt-nodejs');


const ksocutil = require('karmasoc-util');

export default class UserRepository {


    private deviceDb: deviceRepository<IDevice>

    constructor() {
        this.deviceDb = new DeviceRepository();
    }

    private getForUI = (elem: IUser, meId: any) => {
        if (!elem.settings) {
            return _.pick(elem, ['_id', 'firstName', 'lastName', 'followers', 'following', 'images', 'friends']);
        }
        if (elem.settings["profile"] == "private") {
            return _.pick(elem, ['_id', 'firstName', 'lastName', 'images']);
        }
        else if (elem.settings["profile"] == "friends" && !elem.following.every(userId => userId === meId)) {
            return _.pick(elem, ['_id', 'firstName', 'lastName', 'images']);
        }
        else if (elem.settings["profile"] == "friends") {
            if (elem.settings["following"] == "private") {
                return _.pick(elem, ['_id', 'firstName', 'lastName', 'images', 'followers']);
            }
            else
                return _.pick(elem, ['_id', 'firstName', 'lastName', 'images', 'followers', 'following']);
        }
        //public profile
        else if (elem.settings["following"] == "private") {
            return _.pick(elem, ['_id', 'firstName', 'lastName', 'followers', 'images']);
        }
        else if (elem.settings["following"] == "friends" && !elem["following"].every(userId => userId === meId)) {
            return _.pick(elem, ['_id', 'firstName', 'lastName', 'followers', 'images']);
        }
        else {
            return _.pick(elem, ['_id', 'firstName', 'lastName', 'followers', 'following', 'images', 'friends']);
        }
    };

    private deletePassword = (elem => {
        delete elem.password;
        delete elem.temp_pw;
        return elem;
    });

    private generatePasswordToken = (password) => {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    return reject(err);
                }
                bcrypt.hash(password, salt, null, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(hash);
                });
            });
        });
    };

    private comparePassword = (plain, password) => {
        return new Promise((resolve, reject) => {
            if (!plain || !password) {
                return reject('wrong_password');
            }
            bcrypt.compare(plain, password, (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (!res) {
                    return reject('wrong_password');
                }
                return resolve();
            });
        });
    };

    private make_passwd = (length) => {
        let a = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
        let index = (Math.random() * (a.length - 1)).toFixed(0);
        return length > 0 ? a[index] + this.make_passwd(length - 1) : '';
    };

    login = (message, next) => {
        Joi.validate(message.data, validation.login, (err, user) => {
            if (err) {
                return util.validationError(err, 'login service', next);
            }
            let deviceId = user.requesting_device_id;
            delete user.requesting_device_id;
            let _user: any = {};
            let userId: ObjectID;
            Db.findUserByMail(user.mail.toLocaleLowerCase())
                .then(dbUser => {
                    if (!dbUser) {
                        throw 'not found'
                        //return next(null, { err: { msg: 'LOGIN_FAILED' } });
                    }
                    _user = dbUser;
                    userId = dbUser._id;
                    return this.comparePassword(user.password, _user.password);
                })
                .catch(err => {
                    if (err === 'wrong_password') {
                        // check on possible temp pw
                        return this.comparePassword(user.password, _user.temp_pw)
                            .then(() => {
                                return Db.useTempPw(userId, _user.temp_pw);
                            });
                    } else {
                        throw err;
                    }
                })
                // user email identity confirmation
                .then(() => {
                    if (!_user.confirmMail) {
                        throw 'email not confirmed';
                    }
                })
                .then(() => {
                    delete _user.password;
                    let temp = delete _user.temp_pw;

                    next(null, { data: _user });

                    //this.deviceDb.activateDevice(deviceId, userId);

                    // delete temp pw if present

                    // if (temp) {
                    //    Db.deleteTempPw(userId);
                    //  }
                    // return next(null, { data: _user });
                })
                .catch(err => {
                    if (err === 'email not confirmed') {
                        return next(null, { err: { msg: 'LOGIN_FAILED', detail: 'Email not confirmed' } });
                    }
                    if (err === 'wrong_password') {
                        return next(null, { err: { msg: 'LOGIN_FAILED', detail: 'Wrong Password' } });
                    }
                    if (err === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'Log in service', next);
                });
        });
    };

    smLogin = (message, next) => {
        Joi.validate(message.data, validation.smLogin, (err, user: any) => {
            if (err) {
                return util.validationError(err, 'Social media login service', next);
            }
            let deviceId = user.requesting_device_id;
            //delete user.requesting_device_id;
            Db.findUserBySMId(user.id)
                .then(dbUser => {
                    if (dbUser) {
                        // i know this user, give him back
                        this.deviceDb.activateDevice(deviceId, dbUser._id);
                        next(null, { data: dbUser });
                    }
                    else {
                        //is sm-user already a normal user?
                        if (user.mail) {
                            Db.findUserByMail(user.mail.toLocaleLowerCase())
                                .then(mailUser => {
                                    if (mailUser) {
                                        return next(null, {
                                            err: {
                                                msg: 'USER_EXISTS',
                                                detail: 'user with this mail already exists'
                                            }
                                        });
                                    } else {
                                        let newUser: any = new User();
                                        newUser.mail = user.mail;
                                        newUser.firstName = user.firstName;
                                        newUser.lastName = user.lastName;
                                        newUser.smId = user.id;
                                        newUser.password = '';
                                        newUser.strategy = user.strategy;
                                        // newUser.requesting_device_id = user.requesting_device_id
                                        Db.createUser(newUser)
                                            .then((result: InsertOneWriteOpResult) => {
                                                newUser._id = result.insertedId;
                                                this.deviceDb.activateDevice(deviceId, newUser._id);
                                                return next(null, { data: newUser });


                                            });
                                    }
                                });
                        }

                    }
                })
                .catch(err => {
                    return util.serviceError(err, 'Social media service', next);
                });
        });
    };

    changePassword = (message, next) => {
        Joi.validate(message.data, validation.changePwd, (err, user) => {
            if (err) {
                return util.validationError(err, 'Change password service', null);
            }

            Db.findUserById(user.user_id)
                .then(res => this.comparePassword(user.old_password, res.password))
                .then(() => this.generatePasswordToken(user.new_password))
                .then((hash: string) => Db.changePassword(user.user_id, hash))
                .then(() => next(null, { data: { ok: 'true' } }))
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    if (err === 'wrong_password') {
                        return next(null, { err: { msg: 'LOGIN_FAILED', detail: 'Wrong password' } });
                    }
                    return util.serviceError(err, 'change password service', next);
                });
        });
    };

    addBackgroundImageToUser = (message, next) => {
        Joi.validate(message.data, validation.addImage, (err, data) => {
            if (err) {
                return util.validationError(err, 'add image to user service', next);
            }
            Db.addImageToUser(data.user_id, data.images)
                .then((dbValue: any) => this.deletePassword(dbValue.value))
                .then(user => next(null, { data: user }))
                .catch(err => util.serviceError(err, 'Add image to user service', next));
        });
    };


    forgetPassword = (message, next) => {
        Joi.validate(message.data, validation.mail, (err, user) => {
            if (err) {
                return util.validationError(err, 'forget password service', null);
            }
            // create new password
            let newPw = this.make_passwd(7);
            Db.findUserByMail(user.mail.toLocaleLowerCase())
                .then(res => {
                    if (!res) {
                        throw new Error('not found');
                    }
                    if (res.hasOwnProperty('fbId')) {
                        throw new Error('illegal operation');
                    }
                    return this.generatePasswordToken(newPw);
                })
                .then((hash: string) => Db.updateUserWithTempPassword(user.mail.toLocaleLowerCase(), hash))
                .then(() => next(null, { data: { new_password: newPw } }))
                .catch(err => {
                    if (err.message === 'illegal operation') {
                        return next(null, { err: { msg: 'ILLEGAL_OPERATION', detail: 'Unable to reset fb password' } });
                    }
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'forget password service', next);
                });
        });

    };

    addImageToUser = (message, next) => {

        Joi.validate(message.data, validation.addImage, (err, data) => {

            if (err) {
                return util.validationError(err, 'add image to user service', next);
            }

            Db.addImageToUser(data.user_id, data.images)
                .then((dbValue: any) => this.deletePassword(dbValue.value))
                .then(user => next(null, { data: user }))
                .catch(err => util.serviceError(err, 'Add image to user service', next));
        });

    };

    addBgImageToUser = (message, next) => {

        Joi.validate(message.data, validation.addBgImage, (err, data) => {

            if (err) {
                return util.validationError(err, 'add bd image to user service', next);
            }

            Db.addBgImageToUser(data.user_id, data.bgimages)
                .then((dbValue: any) => this.deletePassword(dbValue.value))
                .then(user => {
                    return next(null, { data: user })
                })
                .catch(err => util.serviceError(err, 'Add image to user service', next));
        });

    };

    register = (message, next) => {
        //log.info(message.data);
        console.log(message.data);
        Joi.validate(message.data, validation.register, (err, user) => {
            if (err) {
                return util.validationError(err, 'user register service', next);
            }
            //  let deviceId = user.requesting_device_id;
            // delete user.requesting_device_id;
            Db.findUserByMail(user.mail.toLocaleLowerCase())
                .then(dbuser => {
                    if (dbuser) {
                        return next(null, { err: { msg: 'USER_EXISTS', detail: 'user with this mail already exists' } });
                    }
                    else {
                        return this.generatePasswordToken(message.data.password)
                            .then(hash => {
                                user.password = hash;
                                user.mail = user.mail.toLowerCase();
                                user.strategy = 'default';
                                user.following = [];
                                user.images = {
                                    normal: '',
                                    small: ''
                                };
                                user.confirmMail = false;
                                return Db.createUser(user)
                                    .then(result => {
                                        user.id = result.insertedId;
                                        delete user.password;
                                        next(null, { data: user });
                                        //this.deviceDb.activateDevice(deviceId, user._id);
                                    })
                                    .catch(err => util.serviceError(err, 'User register service', next));
                            })
                    }
                });
        })
    };


    confirmEmail = (message, next) => {
        Joi.validate(message.data, validation.confirmEmail, (err, validatedData) => {

            if (err) {
                return util.validationError(err, 'confirm email service', next);
            }

            Db.findUserById(validatedData.id)
                .then(() => Db.setConfirmEmail(validatedData.id))
                .then(user => next(null, { data: { isEmailConfirmed: true } }))
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'confirm email service', next);
                });
        })
    }


    follow = (message, next) => {
        Joi.validate(message.data, validation.follow, (err, validatedData) => {
            if (err) {
                return util.validationError(err, 'user follow service', next);
            }
            // don't follow yourself
            if (validatedData.user_id === validatedData.follow_id) {
                return next(null, { err: { msg: 'SELF_FOLLOW', detail: 'Can\'t follow yourself' } });
            }
            Db.findUserById(validatedData.follow_id)
                .then(() => Db.updateFollow(validatedData.user_id, validatedData.follow_id, false))
                .then((response: any) => {
                    return this.deletePassword(response.value);
                })
                .then(user => next(null, { data: user }))
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'follow service', next);
                });
        });
    };

    unFollow = (message, next) => {
        Joi.validate(message.data, validation.follow, (err, validatedData) => {

            if (err) {
                return util.validationError(err, 'user unfollow service', next);
            }

            if (validatedData.user_id === validatedData.follow_id) {
                return next(null, { err: { msg: 'SELF_FOLLOW', detail: 'Can\'t unfollow yourself' } });
            }

            Db.findUserById(validatedData.follow_id)
                .then(() => Db.updateFollow(validatedData.user_id, validatedData.follow_id, true))
                .then(response => {
                    return this.deletePassword(response.value);
                }
                )
                .then(user => {
                    return next(null, { data: user });
                }
                )
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'follow service', next);
                });
        });
    };

    getFollowers = (message, next) => {

        Joi.validate(message.data, validation.getUser, (err, user) => {

            if (err) {
                return util.validationError(err, 'get follower service ', next);
            }

            Promise.all([ksocutil.safeObjectId(message.data.userId), Db.getFollowersByUserId(user.user_id)])
                .then((ids: [string, any[]]) => ids[1].map(user => this.getForUI(user, ids[0])))
                .then(follower => { next(null, { data: follower }) })
                .catch(err => util.serviceError(err, 'Get Follower service', next));
        });
    };

    getFollowing = (message, next) => {
        Joi.validate(message.data, validation.getFollowing, (err, data) => {

            if (err) {
                return util.validationError(err, 'get following service ', next);
            }

            Db.getFollowingByUserId(data.user_id)
                .then((followingIds: string[]) => Db.findUsersById(followingIds))
                .then(following => following.map(user => this.getForUI(user, message.data.user_id)))
                .then(users => next(null, { data: users }))
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'get following service', next);
                });
        });

    };

    getUserByIdDeprecated = (message, next) => {

        //log.warn('Deprecated Pattern called', {message: message});

        this.getUserById(message, next);
    };

    getAllUsersById = (message, next) => {
        Joi.validate(message.data, validation.idArray, (err, data) => {

            if (err) {
                return util.validationError(err, 'get user by id service ', next);
            }

            Db.findUserById(data.user_ids)
                .then(user => {
                    return this.getForUI(user, message.requesting_user_id)
                })
                .then(user => {
                    next(null, { data: user })
                })
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'get user by id service', next);
                });
        });
    };

    getUserById = (message, next) => {
        Joi.validate(message.data, validation.getUser, (err, currentuser) => {

            if (err) {
                return util.validationError(err, 'get user by id service ', next);
            }

            Db.findUserById(currentuser.user_id)
                .then(user => {
                    if (currentuser.user_id == message.requesting_user_id) {
                        return this.deletePassword(user)
                    }
                    else {
                        return this.getForUI(user, message.requesting_user_id)
                    }
                }

                )
                .then(user => {
                    next(null, { data: user })
                })
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    if (err.message === 'Invalid id' || err.message === 'Invalid user_id') {
                        return next(null, { err: { msg: 'INVALID_ID', detail: 'Invalid user id' } });
                    }
                    return util.serviceError(err, 'get user by id service', next);
                });
        });
    };

    getUserByMail = (message, next) => {
        Joi.validate(message.data, validation.getUserByMail, (err, user) => {

            if (err) {
                return util.validationError(err, 'get user by id service ', next);
            }

            Db.findUserByMail(user.mail.toLowerCase())
                .then(user => {
                    if (!user) {
                        throw new Error('not found');
                    }

                    return this.deletePassword(user);
                })
                .then(user => next(null, { data: user }))
                .catch(err => {
                    if (err.message === 'not found') {
                        return next(null, { err: { msg: 'NOT_FOUND', detail: 'User not found' } });
                    }
                    return util.serviceError(err, 'get user by id service', next);
                });
        });
    };

    getUserInfo = (message, next) => {
        Db.getUserInfo(message.data.userIds)
            .then(users => {
                console.log(users);
                return users.map(user => this.getForUI(user, message.data.requesting_user_id));
            })
            .then(users => next(null, { data: users }))
            .catch(err => {
                return util.serviceError(err, 'get all user service', next);
            });
    }

    getAllUserExceptMe = (message, next) => {
        Db.getFollowingByUserId(message.data.userId)
            .then((ids: string[]) => {
                Db.getAllUserExcept([...ids, message.data.userId])
                    .then(users => {
                        console.log(users);
                        return users.map(user => this.getForUI(user, message.data.userId));
                    })
                    .then(users => next(null, { data: users }))
                    .catch(err => {
                        return util.serviceError(err, 'get all user service', next);
                    });
            })
    };

    getFollowersCountByUserId = (message, next) => {
        Joi.validate(message.data, validation.getUser, (err, user) => {
            if (err) {
                return util.validationError(err, 'get followers count by user id service ', next);
            }
            Db.getFollowersCountByUserId(user.user_id)
                .then(count => next(null, { count: count }))
                .catch(err => util.serviceError(err, 'get user by id service', next));
        });
    };

    getSettings = (message, next) => {
        Joi.validate(message.data, validation.getUser, (err, user) => {

            if (err) {
                return util.validationError(err, 'get settings by user id service ', next);
            }

            Db.getSettings(user.user_id)
                .then(settings =>
                    next(null, { data: settings }))
                .catch(err =>
                    util.serviceError(err, 'get user settings', next));
        });
    };


    updateSettings = (message, next) => {
        Joi.validate(message.data, validation.upateSettings, (err, data) => {
            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }

            Db.updateSettings(data.user_id, data.settings)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    };

    // Remove validation and change data.personalContact -> personalInfo
    updatePersonalContact  = (message, next) => {
        Joi.validate(message.data, (err, data) => {
            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }
            Db.updatePersonalContact(data.user_id, data.personalInfo)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    }
    //  updatePersonalContact  = (message, next) => {
    //     Joi.validate(message.data, validation.personalContact, (err, data) => {
    //         if (err) {
    //             return util.validationError(err, 'update settings by user id service ', next);
    //         }
    //         Db.updatePersonalContact(data.user_id, data.personalContact)
    //             .then(next(null, { data: { ok: 'true' } }))
    //             .catch(err => util.serviceError(err, 'update user settings', next));
    //     });
    // }

    updatePersonalInfo  = (message, next) => {
        Joi.validate(message.data, (err, data) => {
            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }
            Db.updatePersonalInfo(data.user_id, data.personalInfo)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    }

    updateCustomUrls = (message, next) => {
        Joi.validate(message.data, (err, data) => {
            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }
            Db.updateSettings(data.user_id, data.customUrls)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    }

    updateUserPlacesHistory = (message, next) => {
        Joi.validate(message.data, (err, data) => {

            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }

            Db.updateUserPlacesHistory(data.user_id, data.placesHistory)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    }

    updateUserWorkHistory = (message, next) => {
        Joi.validate(message.data, (err, data) => {

            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }

            Db.updateUserWorkHistory(data.user_id, data)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    }

    updateUserStory = (message, next) => {
        Joi.validate(message.data, (err, data) => {

            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }

            Db.updateUserStory(data.user_id, data.userStory)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    }

    updateUserEducationHistory = (message, next) => {
        Joi.validate(message.data, (err, data) => {

            if (err) {
                return util.validationError(err, 'update settings by user id service ', next);
            }

             Db.updateUserEducationHistory(data.user_id, data)
                .then(next(null, { data: { ok: 'true' } }))
                .catch(err => util.serviceError(err, 'update user settings', next));
        });
    }
}


