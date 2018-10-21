'use strict';
require('source-map-support').install();

import * as Bluebird from 'bluebird';
import * as Seneca from 'seneca';
import * as reporter from './lib/reporter';
import * as util from './lib/util';
import * as posts from './lib/posts';
import * as user from './lib/user';
import * as biz from './lib/biz';
let config = require('config');

const modules = {
    posts: posts,
    user: user,
    biz: biz
};

let getFunctionByRoleAndCmd;
const patternPin = 'role:reporter';
export const seneca = Seneca({
    actcache: {
      active: true,
      size: 257
    }
  });
reporter.init()
    .then(() => {
        seneca
            .use('seneca-amqp-transport')
            .add(patternPin + ',cmd:*', (m, n) => {
                n(null, {});
                if (m.requesting_user_id === 'unknown') {
                    return console.log('doing nothing, requesting user is not logged in');
                }
                getFunctionByRoleAndCmd(m.origin_role, m.cmd)(m);
            })
            .add(patternPin + ',cmd:getTrending,by:text', reporter.getTrendingPosts)
            .add(patternPin + ',cmd:getTrending,by:photo', reporter.getTrendingPhotos)
            .add(patternPin + ',cmd:getTrending,by:videos', reporter.getTrendingVideos)
            .add(patternPin + ',cmd:recommendationForPerson', reporter.recommendationForPerson)
            .add(patternPin + ',cmd:recommendationForThing', reporter.recommendationForThing)
            .listen({
                type: 'amqp',
                url: config.has("rabbitmqCloudUrl") ? config.get("rabbitmqCloudUrl") : `amqp://${config.get('rabbitmq.username')}:${config.get('rabbitmq.password')}@${config.get('rabbitmq.host')}:${config.get('rabbitmq.port')}`,
                pin: patternPin
            })
    }).catch((ex) => {
        throw ex;
    });

getFunctionByRoleAndCmd = (role, cmd) => {
    console.log('incomming report for role', role, 'with cmd', cmd);
    return modules[role] && modules[role][cmd] ? modules[role][cmd] : util.noop;
};