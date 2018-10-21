'use strict';
const bizroutes = [];
const bizhandler = require('../controllers/businessController');
const bizvalidation = require('../validations/bizValidation');
const bizfileValidation = require('../validations/fileValidation');
const conf = require('config');

let proxyUri1 = conf.get("env.host.karmasoc-mediaserve") + ":" + conf.get("env.port.karmasoc-mediaserve");

bizroutes.push({
    method: 'GET',
    path: '/biz/suggested',
    handler: bizhandler.getSuggestedBiz,
    config: {
        cors: true,
        description: 'Get business by its user id',
        notes: 'Returns a object.',
        tags: ['api', 'business'],
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'GET',
    path: '/biz/my/following',
    handler: bizhandler.getFollowingBizOfUser,
    config: {
        cors: true,
        description: 'Get following business by its  user id',
        notes: 'Returns a object array.',
        tags: ['api', 'business'],
        auth: 'jwt'
    }
});



bizroutes.push({
    method: 'POST',
    path: '/biz/bgimage',
    handler: {
        proxy: {
            uri: proxyUri1 + '/image/biz',
            passThrough: true,
            acceptEncoding: false,
            onResponse: bizhandler.bizImageUploadResponse
        }
    },
    config: {
        auth: 'jwt',
        description: 'Upload an biz image',
        notes: 'request will be proxied',
        tags: ['api', 'image', 'biz', 'new']
    }
});


bizroutes.push({
    method: 'POST',
    path: '/biz/image',
    handler: {
        proxy: {
            uri: proxyUri1 +  '/image/biz',
            passThrough: true,
            acceptEncoding: false,
            onResponse: bizhandler.bizImageUploadResponse
        }
    },
    config: {
        auth: 'jwt',
        description: 'Upload an biz image',
        notes: 'request will be proxied',
        tags: ['api', 'image', 'biz', 'new'],
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 8// 8MB
        }
    }
});

bizroutes.push({
    method: 'POST',
    path: '/biz/{follow_id}/follow',
    handler: bizhandler.follow,
    config: {
        description: 'follow another biz',
        tags: ['api', 'user', 'follow'],
        validate: {
            params: bizfileValidation.follow
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'POST',
    path: '/biz/{follow_id}/unfollow',
    handler: bizhandler.unfollow,
    config: {
        description: 'unfollow another biz',
        tags: ['api', 'user', 'unfollow'],
        validate: {
            params: bizfileValidation.follow
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'GET',
    path: '/biz/{bizId}/following',
    handler: bizhandler.getFollowingByBizId,
    config: {
        description: 'get the business which {bizId} follows',
        tags: ['api', 'bis', 'follow'],
        validate: {
            params: bizfileValidation.bizId
        },
        auth: {
            mode: 'try',
            strategy: 'jwt'
        }
    }
});


bizroutes.push({
    method: 'GET',
    path: '/biz/{bizId}/follower',
    handler: bizhandler.getFollowerByBiz,
    config: {
        auth: {
            mode: 'try',
            strategy: 'jwt'
        },
        description: 'get the follower from business',
        tags: ['api', 'business', 'follow'],
        validate: {
            params: bizfileValidation.bizId
        }
    }
});


bizroutes.push({
    method: 'POST',
    path: '/biz',
    handler: {
        proxy: {
            uri: `${proxyUri1}/image/biz`,
            passThrough: true,
            acceptEncoding: false,
            onResponse: bizhandler.createBizAfterImageUpload
        }
    },
    config: {
        description: 'adds a new business',
        notes: 'success note',
        tags: ['api', 'business', 'new'],
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 6// 6MB
        }
    }
});

bizroutes.push({
    method: 'POST',
    path: '/new/biz',
    handler: bizhandler.createBiz,
    config: {
        description: 'adds a new business',
        notes: 'success note',
        tags: ['api', 'business', 'new'],
        auth: 'jwt',
         validate: {
            payload: bizvalidation.register
        }
    }
});

bizroutes.push({
    method: 'GET',
    path: '/biz/user/{userId}',
    handler: bizhandler.getBizByUserId,
    config: {
        auth: 'jwt',
        description: 'get user by id',
        tags: ['api', 'user'],
        validate: {
            params: bizvalidation.userIDBiz
            //,
            // query: validation.count
        }
    }
});

bizroutes.push({
    method: 'GET',
    path: '/my/biz',
    handler: bizhandler.mybiz,
    config: {
        description: 'Get data for bizscreen',
        notes: 'returns object with two arrays: messages and businesses',
        tags: ['api', 'bizscreen', 'messages', 'businesses'],
        auth: {
            mode: 'optional',
            strategy: 'jwt'
        },
        validate: {
            query: bizvalidation.nearbyQueryOptional
        }
    }
});

bizroutes.push({
    method: 'GET',
    path: '/my/bizscreen',
    handler: bizhandler.getBizScreen,
    config: {
        description: 'Get data for bizscreen',
        notes: 'returns object with two arrays: messages and businesses',
        tags: ['api', 'bizscreen', 'messages', 'businesses'],
        auth: {
            mode: 'optional',
            strategy: 'jwt'
        },
        validate: {
            query: bizvalidation.nearbyQueryOptional
        }
    }
});


bizroutes.push({
    method: 'GET',
    path: '/biz/{bizId}',
    handler: bizhandler.getBizById,
    config: {
        cors: true,
        description: 'Get business by its id',
        notes: 'Returns a object.',
        tags: ['api', 'business'],
        validate: {
            params: bizvalidation.bizId
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'GET',
    path: '/biz/users/{userId}',
    handler: bizhandler.getBizByUserId,
    config: {
        description: 'get all business by the userId',
        notes: 'Returns an array.',
        tags: ['api', 'business'],
        validate: {
            params: bizvalidation.userIDBiz
        },
        auth: 'jwt'
    }
});


bizroutes.push({
    method: 'GET',
    path: '/places/search',
    handler: bizhandler.getPlacesByName,
    config: {
        description: 'Get places by its name',
        notes: 'Returns an object.',
        tags: ['api', 'places'],
        validate: {
            query: bizvalidation.coordinates
        },
        auth: 'jwt'
    }
});


bizroutes.push({
    method: 'GET',
    path: '/biz/nearby',
    handler: bizhandler.getBizNearby,
    config: {
        cors: true,
        description: 'Find nearby businesses',
        notes: 'Returns a object with a results array. Each element has a distance property and the business itself.',
        tags: ['api', 'business'],
        validate: {
            query: bizvalidation.nearbyQuery
        },
        auth: 'jwt'
    }
});


bizroutes.push({
    method: 'DELETE',
    path: '/biz/delete/{bizId}',
    handler: bizhandler.deleteBiz,
    config: {
        description: 'delete a business by its id',
        notes: 'success note.',
        tags: ['api', 'business'],
        validate: {
            params: bizvalidation.deleteBiz
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'POST',
    path: '/geobiz',
    handler: bizhandler.postGeoBiz,
    config: {
        description: 'mark a place as geobiz',
        notes: 'Returns a object with the database object.',
        tags: ['api', 'geobiz'],
        validate: {
            payload: bizvalidation.postGeoBiz
        },
        auth: 'jwt'
    }
});


bizroutes.push({
    method: 'GET',
    path: '/geobiz/nearby',
    handler: bizhandler.getGeoBizNearby,
    config: {
        description: 'mark a place as geobiz',
        notes: 'Returns a object with the database object.',
        tags: ['api', 'geobiz'],
        validate: {
            query: bizvalidation.nearbyQuery
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'GET',
    path: '/my/biz/favored',
    handler: bizhandler.getMyFavoriteBiz,
    config: {
        description: 'Get favored business by currently logged in user',
        notes: 'thank yoou',
        tags: ['api', 'business', 'fav'],
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'GET',
    path: '/biz/users/{userId}/favored',
    handler: bizhandler.getFavoriteBizByUserId,
    config: {
        description: 'Get favored business by user id',
        notes: 'piffpaff',
        tags: ['api', 'business', 'fav'],
        validate: {
            params: bizvalidation.userIDBiz
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'GET',
    path: '/biz/getallcategories',
    handler: bizhandler.getBizLookup,
    config: {
        description: 'Get all biz categories',
        notes: 'piffpaff',
        tags: ['api', 'business', 'categories'],
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'GET',
    path: '/biz/{category_id}/getsubcategories',
    handler: bizhandler.getSubcategories,
    config: {
        description: 'Get all biz subcategories',
        notes: 'get subcategories',
        tags: ['api', 'business', 'categories'],
        auth: 'jwt',
        validate: {
            params: bizvalidation.category_id
        },
    }
});


bizroutes.push({
    method: 'POST',
    path: '/biz/{bizId}/favor/toggle',
    handler: bizhandler.postToggleFavorBiz,
    config: {
        description: 'Toggle: (Un-)Favor a business by the currently logged in user',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'business', 'favor', 'favorites'],
        validate: {
            params: bizvalidation.bizId
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'POST',
    path: '/biz/{bizId}/favor',
    handler: bizhandler.postFavorBiz,
    config: {
        description: 'Favor a business by the currently logged in user',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'business', 'favor', 'favorites'],
        validate: {
            params: bizvalidation.bizId
        },
        auth: 'jwt'
    }
});

bizroutes.push({
    method: 'POST',
    path: '/biz/{bizId}/unfavor',
    handler: bizhandler.postUnfavorBiz,
    config: {
        description: 'Unfavor a business by the currently logged in user',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'business', 'favor', 'favorites'],
        validate: {
            params: bizvalidation.bizId
        },
        auth: 'jwt'
    }
});

module.exports.routes = bizroutes;
