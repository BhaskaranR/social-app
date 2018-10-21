'use strict';
const routes = [];
const configuration = require('config');

import *  as  fileValidation from '../validations/fileValidation';
import * as  validation from '../validations/userValidation';

import UserController from '../controllers/userController';
// import imagesController from '../controllers/imagesController';

const proxyUri = configuration.get("env.host.karmasoc-mediaserve") + ":" + configuration.get("env.port.karmasoc-mediaserve");


/*routes.push({
    method: 'POST',
    path: '/users/image',
    handler: imagesController.imageupload,
    config: {
        auth: 'jwt',
        description: 'Upload an user image',
        notes: 'request will be proxied',
        tags: ['api', 'image', 'user', 'new'],
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 8// 8MB
        }
    }
});
*/


routes.push({
    method: 'POST',
    path: '/users/login',
    config: {
        auth: false,
        description: 'perform login',
        tags: ['api', 'user', 'login'],
        handler: UserController.login,
        validate: {
            payload: validation.login
        }
    }
});

routes.push({
    method: 'GET',
    path: '/users/protected',
    handler: UserController.protected,
    config: {
        description: 'protected',
        tags: ['api', 'test', 'protected'],
        auth: 'jwt'
    }
});

/*routes.push({
    method: 'GET',
    path: '/users/googleurl',
    handler: UserController.googleplusurl,
    config: {
        auth: false,
        description: 'google plus url',
        tags: ['api', 'user', 'logout'],
    }
});*/

routes.push({
    method: 'GET',
    path: '/users/facebookurl',
    handler: UserController.facebookurl,
    config: {
        auth: false,
        description: 'favebook plus url',
        tags: ['api', 'user', 'logout'],
    }
});



routes.push({
    method: 'GET',
    path: '/users/facebooklogin',
    config: {
        auth: false,
        description: 'perform facebook login',
        tags: ['api', 'user', 'login'],
        handler: UserController.fbLogin,
    }
});



routes.push({
    method: 'GET',
    path: '/users/logout',
    handler: UserController.logout,
    config: {
        auth: 'jwt',
        description: 'log out, kill session',
        tags: ['api', 'user', 'logout'],
    }
});

routes.push({
    method: 'POST',
    path: '/users/register',
    handler: UserController.register,
    config: {
        auth: false,
        description: 'register user',
        tags: ['api', 'user', 'register'],
        validate: {
            payload: validation.register
        }
    }
});

routes.push({
    method: 'POST',
    path: '/users/register/image',
    handler: {
        proxy: {
            uri: configuration.get("env.host.karmasoc-mediaserve") + configuration.get('env.port.karmasoc-mediaserve') + "/users/register/image",
            passThrough: true,
            acceptEncoding: false,
            onResponse: UserController.userRegisterImageUploadRespone
        }
    },
    config: {
        auth: 'jwt',
        description: 'register user with image',
        tags: ['api', 'user', 'register', 'image']
    }
});


routes.push({
    method: 'POST',
    path: '/users/forgetPassword',
    handler: UserController.forgetPassword,
    config: {
        auth: false,
        description: 'Resets password and notify user',
        tags: ['api', 'user', 'password'],
        validate: {
            payload: validation.userMail
        }
    }
});
``
routes.push({
    method: 'GET',
    path: '/users/confirmemail/{userId}',
    handler: UserController.confirmEmail,
    config: {
        auth: false,
        description: 'Confirms user email identity',
        tags: ['api', 'user', 'verifyemail', 'confirmemail'],
        validate: {
            params: validation.userId
        }
    }
})

routes.push({
    method: 'GET',
    path: '/users/fetchAll',
    handler: UserController.getAllUsers,
    config: {
        auth: 'jwt',
        description: 'Get all availale users',
        tags: ['api', 'user']
    }
})

routes.push({
    method: 'GET',
    path: '/users/{userId}',
    handler: UserController.getUserById,
    config: {
        auth: 'jwt',
        description: 'get user by id',
        tags: ['api', 'user'],
        validate: {
            params: validation.userId
            //,
            // query: validation.count
        }
    }
});


routes.push({
    method: 'PUT',
    path: '/my/users/changePwd',
    handler: UserController.changePwd,
    config: {
        auth: 'jwt',
        description: 'change password',
        tags: ['api', 'user', 'password'],
        validate: {
            payload: validation.updatePwd
        }
    }
});

routes.push({
    method: 'POST',
    path: '/users/bgimage',
    handler:   UserController.userImageUploadResponse,
    config: {
        auth: 'jwt',
        description: 'Upload an user image',
        notes: 'request will be proxied',
        tags: ['api', 'image', 'user', 'new']
    }
});


routes.push({
    method: 'POST',
    path: '/users/image',
    handler: {
        proxy: {
            uri: proxyUri +  '/image/user',
            passThrough: true,
            acceptEncoding: false,
            onResponse: UserController.userImageUploadResponse
        }
    },
    config: {
        auth: 'jwt',
        description: 'Upload an user image',
        notes: 'request will be proxied',
        tags: ['api', 'image', 'user', 'new'],
        payload: {
            output: 'stream',
            parse: false,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 8// 8MB
        }
    }
});

routes.push({
    method: 'GET',
    path: '/users/image/{fileId}.{ext}',
    handler: {
        proxy: {
            mapUri: (request, callback) => {
                callback(null, proxyUri + '/file/' + request.params.fileId +  '.' + request.params.ext);
            }
        }
    },
    config: {
        auth: {
            mode: 'try',
            strategy: 'jwt'
        },
        description: 'Get Image',
        notes: 'Retrieve an image from a user',
        validate: {
            params: fileValidation.getFile
        },
        tags: ['api']
    }
});



routes.push({
    method: 'POST',
    path: '/users/{follow_id}/follow',
    handler: UserController.follow,
    config: {
        description: 'follow another user',
        tags: ['api', 'user', 'follow'],
        validate: {
            params: validation.follow
        },
        auth: 'jwt'
    }
});

routes.push({
    method: 'POST',
    path: '/users/{follow_id}/unfollow',
    handler: UserController.unfollow,
    config: {
        description: 'unfollow another user',
        tags: ['api', 'user', 'unfollow'],
        validate: {
            params: validation.follow
        },
        auth: 'jwt'
    }
});

routes.push({
    method: 'GET',
    path: '/my/users/following',
    handler: UserController.getMyFollowing,
    config: {
        description: 'get the users im following',
        tags: ['api', 'user', 'follow'],
        auth: 'jwt'
    }
});

routes.push({
    method: 'GET',
    path: '/users/{userId}/following',
    handler: UserController.getFollowingByUserId,
    config: {
        description: 'get the users which {userId} follows',
        tags: ['api', 'user', 'follow'],
        validate: {
            params: validation.userId
        },
        auth: {
            mode: 'try',
            strategy: 'jwt'
        }
    }
});


routes.push({
    method: 'GET',
    path: '/my/users/follower',
    handler: UserController.getMyFollower,
    config: {
        description: 'get my follower',
        tags: ['api', 'user', 'follow'],
        auth: 'jwt'
    }
});



routes.push({
    method: 'GET',
    path: '/users/{userId}/follower',
    handler: UserController.getFollowerByUser,
    config: {
        auth: {
            mode: 'try',
            strategy: 'jwt'
        },
        description: 'get the follower from user',
        tags: ['api', 'user', 'follow'],
        validate: {
            params: validation.userId
        }
    }
});


routes.push({
    method: 'GET',
    path: '/my/users/settings',
    handler: UserController.getSettings,
    config: {
        description: 'get the users settings',
        tags: ['api', 'user', 'settings'],
        auth: 'jwt'
    }
});


routes.push({
    method: 'POST',
    path: '/my/users/settings',
    handler: UserController.updateSettings,
    config: {
        description: 'update the users settings',
        tags: ['api', 'user', 'settings'],
        auth: 'jwt',
        validate: {
            payload: validation.settings
        },
    }
});



routes.push({
    method: ['POST','DELETE'],
    path: '/my/updatePersonalInfo',
    handler: UserController.updatePersonalInfo,
    config: {
        description: 'update the users personal url',
        tags: ['api', 'user', 'personal Info'],
        auth: 'jwt',
        validate: {
            // payload: validation.personalInfo
        },
    }
});


routes.push({
    method: ['POST','DELETE'],
    path: '/my/updatePersonalContact',
    handler: UserController.updatePersonalContact,
    config: {
        description: 'update the users personal url',
        tags: ['api', 'user', 'personal Info'],
        auth: 'jwt',
        validate: {

        },
    }
});



routes.push({
    method: ['POST','DELETE'],
    path: '/my/updateCustomUrls',
    handler: UserController.updateUserCustomUrl,
    config: {
        description: 'update the users custom url',
        tags: ['api', 'user', 'custom url'],
        auth: 'jwt',
        validate: {
            // payload: validation.userCustomUrls
        },
    }
});

routes.push({
    method: ['POST','DELETE'],
    path: '/my/updatePlacesHistory',
    handler: UserController.updateUserPlacesHistory,
    config: {
        description: 'update the users places history',
        tags: ['api', 'user', 'userPlacesHistory'],
        auth: 'jwt',
        validate: {
            // payload: validation.userPlacesHistory
        },
    }
});



routes.push({
    method: ['POST','DELETE'],
    path: '/my/updateEducationHistory',
    handler: UserController.updateUserEducationHistory,
    config: {
        description: 'update the users user education history',
        tags: ['api', 'user', 'userEducationHistory'],
        auth: 'jwt',
        validate: {
            // payload: validation.userEducationHistory
        },
    }
});


routes.push({
    method: ['POST','DELETE'],
    path: '/my/updateWorkHistory',
    handler: UserController.updateUserWorkHistory,
    config: {
        description: 'update the users work history',
        tags: ['api', 'user', 'updateUserWorkHistory'],
        auth: 'jwt',
        validate: {
            // payload: validation.userWorkHistory
        },
    }
});

routes.push({
    method: ['POST','DELETE'],
    path: '/my/updateUserStory',
    handler: UserController.updateUserStory,
    config: {
        description: 'update the users story',
        tags: ['api', 'user', 'story'],
        auth: 'jwt',
        validate: {
            // payload: validation.userStory
        },
    }
});


module.exports.routes = routes;
