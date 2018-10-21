'use strict';
const Slack = require('slack-node');

const slack = new Slack();

const fns = {};

fns.sendSlackInfo = (channel, text) => {
    
    slack.setWebhook(channel);
    slack.webhook({
        text: JSON.stringify(text)
    }, (err) => {
        if (err) {
            console.log(err);
        }
    });
};

module.exports = fns;
