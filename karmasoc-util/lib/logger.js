'use strict';

const bunyan = require('bunyan');
const BunyanSlack = require('bunyan-slack');
let config = require('config');

const service = require('../../../package.json').name;

let log = bunyan.createLogger({
    name: 'karmasoc',
    src: process.env['NODE_ENV'] !== 'production', // don't log source in production, cause its slow
    serializers: {
        err: bunyan.stdSerializers.err  // pretty error messages
    },
    streams: [
        {
            // log everything above level debug to console
            stream: process.stdout,
            level: bunyan.DEBUG
        },
        {
            // log everything above level warning to rotating file
            type: 'rotating-file',
            level: config.get('env.log.fileLogLevel') || 100,     // log all warnings and above
            path: config.get('env.log.pathLogFileError') + '/' + service + '.log',
            period: '7d',   // rotate after a week
            count: 2        // keep 2 back copies
        },
        {
            // send fatal errors to slack
            stream: new BunyanSlack({
                webhook_url: config.get('slack.errorChannel') || ' '
            }),
            level: config.get('slack.level') || 100
        }
    ]
})
    .child({ service: service });


module.exports = log;
