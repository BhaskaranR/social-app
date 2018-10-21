'use strict';
import * as config from 'config';
import * as util from 'karmasoc-util';
import * as  database from './lib/database';
import * as nearby from './lib/nearby';
import * as promobiz from './lib/promobiz';
import * as biz from './lib/business';
import * as categories from './lib/categories';
import * as newBiz from './lib/newBiz';
const bluebird = require('bluebird');
const seneca = require('seneca')({
    actcache: {
        active: true,
        size: 257
    }
});



const report = function (msg, next) {
    const pprior = bluebird.promisify(this.prior, { context: seneca });
    pprior(msg).then((data) => {
        return data;
    }).then((nn) => {
        try {
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


// select desired transport method
const patternPin = 'role:business';
const amqpUrl = config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`;

// init database
database.connect().then(() => {
    seneca
        .use('seneca-amqp-transport')
        .use(require('seneca-fire-and-forget'))
        .add(patternPin + ',cmd:nearby', nearby.getBizNearby)
        .add(patternPin + 'cmd:addpromobiz', promobiz.addpromoBiz)
        .add(patternPin + ',cmd:nearbypromobiz', promobiz.getPromoBizNearby)
        .add(patternPin + ',cmd:bizById', biz.getBizById)
        .add(patternPin + ',cmd:addnewBiz', newBiz.addNewBiz)
        .add(patternPin + ',cmd:deleteBiz', biz.deleteBiz)
        .add(patternPin + ',cmd:getsuggestedbiz', biz.getAllBizExceptMe)
        .add(patternPin + ',cmd:getfollowingbizofuser', biz.getFollowingBizOfUser)
        .add(patternPin + ',cmd:bizByname', biz.getBizByName)
        .add(patternPin + ',cmd:getbizbyuserid', biz.getBizOfUser)
        //     .add(patternPin + ',cmd:getBizStreamById', biz.getBizStreamById)
        .add(patternPin + ',cmd:getfavoriteBizbyuserid', biz.getFavoriteBizbyUserId)
        .add(patternPin + ',cmd:count,entity:biz,by:userId', biz.getCountForBizByUserId)
        .add(patternPin + ',cmd:getBizLookup', categories.getBizLookup)
        .add(patternPin + ',cmd:getBizSubCategories', categories.getBizSubCategories)
        .add(patternPin + ',cmd:add,entity:image', biz.addImageToBiz)
        .add(patternPin + ',cmd:add,entity:bgimage', biz.addBgImageToBiz)
        .add(patternPin + ',cmd:follow', biz.follow)
        .add(patternPin + ',cmd:unfollow', biz.unFollow)
        .add(patternPin + ',cmd:getfollowers', biz.getFollowers)
        .add(patternPin + ',cmd:getfollowing', biz.getFollowing)
        .add(patternPin + ',cmd:count,entity:follower,by:bizId', biz.getFollowersCountByBizId)
        .listen({
            type: 'amqp',
            url: amqpUrl,
            pin: patternPin
        })
        .client({ type: 'amqp', url: amqpUrl, pin: 'role:reporter' })
        .wrap(patternPin, report);
});