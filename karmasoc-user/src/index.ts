/// <reference path="../typings.d.ts" />
"use strict";
import { Db } from './lib/mongo'
import UserRepository from './lib/user';
import device from './lib/device';
import Configurations from "./configs/configurations";
const util = require('karmasoc-util');
const config = require('config');
const user: UserRepository = new UserRepository();
const seneca = require('seneca')();
const patternPin = 'role:user';
const bluebird = require('bluebird');


const report = function (msg, next) {
    let pprior = bluebird.promisify(this.prior, { context: seneca });
    pprior(msg).then((data) => {
        return data;
    }).then((nn) => {
        try {
            if (msg.cmd == "login" || msg.cmd == "register" || msg.cmd == "follow" || msg.cmd == "unfollow") {
                if (nn && nn.data) {
                    msg.data = nn.data;
                }
                console.log('****************************' + msg.cmd)
                msg.origin_role = msg.role;
                msg.role = 'reporter';

                bluebird.promisify(this.fire, { context: seneca })(msg).then((val) => {
                }).catch(ex => {
                    console.log(ex);
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            next(nn)
        }
    })
        .catch((ex1) => {
            console.log(ex1);
        });
};

const amqpUrl = config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}/`;
Db.connect(Configurations.Repository.connectionString).then(() => {
    seneca
        .use(require('seneca-fire-and-forget'))
        .use('seneca-amqp-transport')
        .add(patternPin + ',cmd:register,entity:device', device.registerDevice)
        .add(patternPin + ',cmd:unregister,entity:device', device.unregisterDevice)
        .add(patternPin + ',cmd:get,entity:pushToken', device.getPushToken)
        .add(patternPin + ',cmd:register,entity:user', user.register)
        .add(patternPin + ',cmd:confirmemail,entity:user', user.confirmEmail)
        .add(patternPin + ',cmd:changePwd', user.changePassword)
        .add(patternPin + ',cmd:smLogin', user.smLogin)
        .add(patternPin + ',cmd:login', user.login)
        .add(patternPin + ',cmd:forgetPassword', user.forgetPassword)
        .add(patternPin + ',cmd:getSettings', user.getSettings)
        .add(patternPin + ',cmd:updateSettings', user.updateSettings)
        .add(patternPin + ',cmd:updateCustomUrls', user.updateCustomUrls)
        .add(patternPin + ',cmd:updatePersonalInfo', user.updatePersonalInfo)
        .add(patternPin + ',cmd:updatePersonalContact', user.updatePersonalContact)
        .add(patternPin + ',cmd:updateUserPlacesHistory', user.updateUserPlacesHistory)
        .add(patternPin + ',cmd:updateUserWorkHistory', user.updateUserWorkHistory)
        .add(patternPin + ',cmd:updateUserStory', user.updateUserStory)
        .add(patternPin + ',cmd:updateUserEducationHistory', user.updateUserEducationHistory)
        .add(patternPin + ',cmd:add,entity:image', user.addImageToUser)
        .add(patternPin + ',cmd:add,entity:bgimage', user.addBgImageToUser)
        .add(patternPin + ',cmd:follow', user.follow)
        .add(patternPin + ',cmd:getfollowers', user.getFollowers)
        .add(patternPin + ',cmd:getfollowing', user.getFollowing)
        .add(patternPin + ',cmd:count,entity:follower,by:userId', user.getFollowersCountByUserId)
        .add(patternPin + ',cmd:unfollow', user.unFollow)
        .add(patternPin + ',cmd:getAllUserExceptMe', user.getAllUserExceptMe)
        .add(patternPin + ',cmd:getUserInfo', user.getUserInfo)
        .add(patternPin + ',cmd:getUser,by:id', user.getUserById)
        .add(patternPin + ',cmd:getUser,by:ids', user.getAllUsersById)
        .add(patternPin + ',cmd:getUser,by:mail', user.getUserByMail).listen({
            type: 'amqp',
            url: amqpUrl,
            pin: patternPin
        })
        .client({ type: 'amqp', url: amqpUrl, pin: 'role:reporter' })
        .wrap(patternPin, report)
});

