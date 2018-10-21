'use strict';
const routes = [];
import VideoController from '../controllers/videoController';


routes.push({
    method: 'GET',
    path: '/video/configuration',
    handler: VideoController.getBitMovinKey,
    config: {
        auth: false,
        description: 'video configuration',
        tags: ['api', 'video', 'bitmovin'],
    }
});




module.exports.routes = routes;
