/// <reference path="../model/posts.ts" />
'use strict';
const routes = [];

const Wreck = require('wreck');
const handler = require('../controllers/postController');
const validation = require('../validations/postValidation');
const fileValidation = require('../validations/fileValidation');

const configuration = require('config');
const proxyUri = configuration.get("env.host.karmasoc-mediaserve") + ":" + configuration.get("env.port.karmasoc-mediaserve");

routes.push({
    method: 'POST',
    path: '/post/{postId}/favor/toggle',
    handler: handler.postToggleFavorPost,
    config: {
        description: 'Toggle: (Un-)Favor a post by the currently logged in user',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'post', 'favor', 'favorites'],
        validate: {
            params: validation.postId //,
          //  payload: validation.favor
        },
        auth: 'jwt'
    }
});

routes.push({
    method: 'POST',
    path: '/post/{postId}/favor',
    handler: handler.postFavorPost,
    config: {
        description: 'Favor a post by the currently logged in user',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'post', 'favor', 'favorites'],
        validate: {
            params: validation.postId //,
          //  payload: validation.favor //TODO
        },
        auth: 'jwt'
    }
});

routes.push({
    method: 'POST',
    path: '/post/{postId}/unfavor',
    handler: handler.postUnfavorPost,
    config: {
        description: 'Unfavor a post by the currently logged in user',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'post', 'favor', 'favorites'],
        validate: {
            params: validation.postId
        },
        auth: 'jwt'
    }
});




routes.push({
    method: 'POST',
    path: '/posts/{postId}/impressions/text',
    handler: handler.postTextImpression,
    config: {
        description: 'add new text-impression to a post',
        notes: 'TODO',
        tags: ['api', 'post', 'impression', 'text'],
        validate: {
            params: validation.postId,
            payload: validation.text
        },
        auth: 'jwt'
    }
});

routes.push({
    method: 'POST',
    path: '/posts/{postId}/impressions/image',
    handler: {
        proxy: {
            uri: proxyUri + '/stream/image',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.createImpressionAfterImageUpload
        }
    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image to a post. Request is proxied to proxy uri',
        tags: ['api', 'post', 'new', 'image'],
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 50// 6MB
        }
    }
});

routes.push({
    method: 'POST',
    path: '/posts/{postId}/impressions/video',
    handler: {
        proxy: {
            uri: proxyUri + '/stream/video',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.createImpressionAfterVideoUpload
        }
    },
    config: {
        description: 'Add video',
        notes: 'Uploads a video to a post. Request is proxied to proxy uri',
        tags: ['api', 'post', 'new', 'video'],
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 50// 6MB
        }
    }
});

routes.push({
    method: 'POST',
    path: '/posts/{postId}/impressions/audio',
    handler: {
        proxy: {
            uri: proxyUri + '/stream/audio',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.createImpressionAfterAudioUpload
        }
    },
    config: {
        description: 'Add audio',
        notes: 'Uploads an audio to a post. Request is proxied to proxy uri',
        tags: ['api', 'post', 'new', 'audio'],
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 50// 6MB
        },
        auth: 'jwt'
    }
});


/** FILES GET **/
routes.push({
     method: 'GET',
     path: '/posts/image/{fileId}.{ext}',
     handler: {
     proxy: {
     mapUri: (request, callback) => {
                callback(null, proxyUri + '/file/' + request.params.fileId + '.' + request.params.ext);
             }
         }
     },
     config: {
     description: 'Get Image',
     notes: 'Retrieve an image from a post',
     auth: false,
     validate: {
        params: fileValidation.getFile
     },
     tags: ['api']
     }
 });

 routes.push({
     method: 'GET',
     path: '/posts/audio/{fileId}/{name}.{ext}',
     handler: {
     proxy: {
     mapUri: (request, callback) => {
          callback(null, proxyUri + '/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
            }
        }
     },
     config: {
     description: 'Get audio',
     notes: 'Retrieve an audio from a post',
     auth: false,
     validate: {
        params: fileValidation.getFile
        },
        tags: ['api']
     }
 });

 routes.push({
     method: 'GET',
     path: '/posts/video/{fileId}/{name}.{ext}',
     handler: {
     proxy: {
     mapUri: (request, callback) => {
          callback(null, proxyUri + '/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
         },
        passThrough: true
        }
     },
     config: {
     description: 'Get video',
     notes: 'Retrieve a video from a post',
     auth: false,
     validate: {
        params: fileValidation.getFile
     },
     tags: ['api']
     }
 });


 routes.push({
     method: 'GET',
     path: '/posts/impression/image/{fileId}/{name}.{ext}',
     handler: {
     proxy: {
     mapUri: (request, callback) => {
            callback(null, proxyUri + '/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
        }
     }
     },
     config: {
     description: 'Get Image',
     notes: 'Retrieve an image impression',
     auth: false,
     validate: {
        params: fileValidation.getImageFile
     },
     tags: ['api']
     }
 });

 routes.push({
     method: 'GET',
     path: '/posts/impression/audio/{fileId}/{name}.{ext}',
     handler: {
     proxy: {
     mapUri: (request, callback) => {
                callback(null, proxyUri + '/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
             }
        }
     },
     config: {
     description: 'Get audio',
     notes: 'Retrieve an audio impression',
     auth: false,
     validate: {
        params: fileValidation.getAudioFile
     },
     tags: ['api']
     }
 });

 routes.push({
     method: 'GET',
     path: '/posts/impression/video/{fileId}/{name}.{ext}',
     handler: {
     proxy: {
     mapUri: (request, callback) => {
         callback(null, proxyUri + '/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
     },
     passThrough: true
     }
     },
     config: {
     description: 'Get video',
     notes: 'Retrieve a video impression',
     auth: false,
     validate: {
     params: fileValidation.getVideoFile
     },
     tags: ['api']
     }
 });


routes.push({
    method: 'POST',
    path: '/posts/new',
    handler: handler.genericpost,
    config: {
        description: 'add new text-post',
        notes: 'TODO',
        tags: ['api', 'post', 'text'],
        validate: {
            payload: validation.post
        },
        auth: 'jwt'
    }
});

  
/* routes.push({
 method: 'DELETE',
    path: '/tempImage/delete',
    handler: {
        proxy: {
            uri: proxyUri + '/file/delete',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.createTempImageLoc
        }
    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image/video to a post. Request is proxied to proxy uri',
        tags: ['api', 'post', 'new', 'image', 'video'],
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data' ,
            maxBytes: 1048576 * 50// 6MB
        }
    }
})
*/

routes.push({
    method: 'POST',
    path: '/posts/new/file',
    handler: {
        proxy: {
            uri: proxyUri + '/file/post',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.createTempImageLoc
        }
    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image/video to a post. Request is proxied to proxy uri',
        tags: ['api', 'post', 'new', 'image', 'video'],
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data' ,
            maxBytes: 1048576 * 50// 50MB
        }
    }
});

routes.push({
    method: 'DELETE',
    path: '/posts/{postId}',
    handler: handler.deletePost,
    config: {
        description: 'delete a post by its id',
        notes: 'success note.',
        tags: ['api', 'posts'],
        validate: {
            params: validation.deletePost
        },
        auth: 'jwt'
    }
});


routes.push({
    method: 'GET',
    path: '/post/{postId}/settings',
    handler: handler.getSettings,
    config: {
        description: 'get the post settings',
        tags: ['api', 'user', 'settings'],
        validate: {
            params: validation.postId
        },
        auth: 'jwt'
    }
});


routes.push({
    method: 'POST',
    path: '/post/{postId}/settings',
    handler: handler.updateSettings,
    config: {
        description: 'update the post settings',
        tags: ['api', 'user', 'settings'],
        auth: 'jwt',
        validate: {
            params: validation.postId,
            payload: validation.settings
        },
    }
});



/* let postVideo ={
    method: 'POST',
    path: '/posts/new/video',
    handler: {
        proxy: {
            uri: proxyUri + '/stream/video',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.createPostAfterVideoUpload
        }
    },
    config: {
        description: 'Add video',
        notes: 'Uploads a video to a post. Request is proxied to proxyUri',
        tags: ['api', 'post', 'new', 'video'],
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 50// 6MB
        }
    }
}; */


module.exports.routes = routes;
