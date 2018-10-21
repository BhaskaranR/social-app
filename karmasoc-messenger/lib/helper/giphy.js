'use strict';

const giphy = require('giphy-api')();

const fns = {};

const extractGiphyUrl = (giphyResponse) => {
    if (giphyResponse.data.length) {
        return giphyResponse.data.map(r => r.images.downsized_large.url);
    }
    return [giphyResponse.data.image_original_url];
};

fns.getGiphy = (messageData, messageTextArray) => {
    let searchWord = messageTextArray[1];
    let giphyFn = giphy.random;
    let giphyOptions;

    if (searchWord) {
        giphyFn = giphy.search;
        giphyOptions = {
            q: searchWord,
            limit: 2
        };
    }
    return giphyFn.apply(giphy, [giphyOptions])
        .then(extractGiphyUrl)
        // TODO: what if no result available
        .then(result => result[0] ? result[0] : '')
        .then(urlString => {
            messageData.message = urlString;
            messageData.message_type = 'giphy';
            return messageData;
        });
};

module.exports = fns;