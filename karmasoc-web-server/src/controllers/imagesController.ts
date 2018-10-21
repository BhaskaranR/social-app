import { ThumboUrl } from '../util/thumbor/thumborUrlBuilder';
import * as redis from 'redis';
import {  PhotoDetails } from '../model/posts';

const redisClient = require('../session/session')() as redis.RedisClient;

module.exports = {
    filterImage
};

function filterImage(request, reply) {
    const clientId = request.payload.clientId;
    const key  = request.payload.key;
    delete request.payload.key;
    redisClient.get(clientId, function (rediserror: Error, redisResp) {
        if (rediserror) {
            reply(boom.create(500, rediserror.message, rediserror));
        }
        else if (redisResp) {
            const rep = JSON.parse(redisResp).images as PhotoDetails[];
            const oldImage = rep.filter(photos => photos.key == key)[0];
            const newImage = Object.assign(oldImage, {
                small: ThumboUrl.filteredSmallPhoto(ThumboUrl.filterImages(key, request.payload)),
                normal: ThumboUrl.filteredNormalPhoto(ThumboUrl.filterImages(key, request.payload)),
                large: ThumboUrl.filteredLargePhoto(ThumboUrl.filterImages(key, request.payload)),
                xlarge: ThumboUrl.filteredVeryLargePhoto(ThumboUrl.filterImages(key, request.payload))
            })
            redisClient.set(clientId, JSON.stringify([...rep.filter(photos => photos.key !== key), [newImage]]));
            reply(newImage);
        }
    });
}