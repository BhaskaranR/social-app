'use strict';
import * as config from 'config';
const bluebird = require('bluebird');

const util = require('karmasoc-util');
import * as database from './lib/database';
const newPost = require('./lib/newPost');
const post = require('./lib/post');
const patternPin = 'role:posts';
const amqpUrl = config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`;
const seneca = require('seneca')();

const report = function (msg, next) {
    const pprior= bluebird.promisify(this.prior, { context: seneca });
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

// init database
database.connect().then(() => {
    seneca
        .use(require('seneca-fire-and-forget'))
        .use('seneca-amqp-transport')
        .add(patternPin + ',cmd:newPost', newPost.newPost)
        .add(patternPin + ',cmd:deletePost', post.deletePost)
        .add(patternPin + ',cmd:favorPost', post.favorPost)
        .add(patternPin + ',cmd:unfavorPost', post.unfavorPost)
        .add(patternPin + ',cmd:toggleFavorPost', post.toggleFavorPost)
        .add(patternPin + ',cmd:addimpression', post.addTextImpression)
        .add(patternPin + ',cmd:addimpression,type:image', post.addImageImpression)
        .add(patternPin + ',cmd:addimpression,type:video', post.addVideoImpression)
        .add(patternPin + ',cmd:addimpression,type:audio', post.addAudioImpression)
        .add(patternPin + ',cmd:deleteImpression', post.deleteImpression)
        .add(patternPin + ',cmd:getSettings', post.getSettings)
        .add(patternPin + ',cmd:count,entity:post,by:userId', post.getCountForPostsByUserId)
        .add(patternPin + ',cmd:updateSettings', post.updateSettings)

        .add(patternPin + ',cmd:getPostsById', post.getPostsById)
        .add(patternPin + ',cmd:getPostByPostId', post.getPostByPostId)
        .add(patternPin + ',cmd:getAllPostByPostId', post.getAllPostByPostId)
        .add(patternPin + ',cmd:getAllPostByUserId', post.getAllPostByUserId)
        .add(patternPin + ',cmd:getProfilePostByUserId', post.getProfilePostByUserId)
        .add(patternPin + ',cmd:getGalleryPostByUserId', post.getGalleryPostByUserId)
        .add(patternPin + ',cmd:getPostByUserIdandPostType', post.getPostByUserIdandPostType)
        .add(patternPin + ',cmd:getFunPostByUserId', post.getFunPostByUserId)
        .add(patternPin + ',cmd:getLearnPostByUserId', post.getLearnPostByUserId)
        .add(patternPin + ',cmd:getMyPagePostByUserId', post.getMyPagePostByUserId)

        .add(patternPin + ',cmd:getAllImpressionsForPostIds', post.getAllImpressionsForPostId)
        .add(patternPin + ',cmd:getImpressionsByPostId', post.getImpressionsByPostId)
        
        
        .listen({
            type: 'amqp',
            url: amqpUrl,
            pin: patternPin
        })
        .client({ type: 'amqp', url: amqpUrl, pin: 'role:reporter' })
        .wrap(patternPin, report)
});