'use strict';

const fns = {};


fns.getShruggie = (messageData) => {
    messageData.message = '¯\_(ツ)_/¯';
    messageData.type = 'text';
    return Promise.resolve(messageData);
};

module.exports = fns;