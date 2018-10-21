'use strict';
const routes = [];
import DeviceController from '../controllers/deviceController';
import * as  validation from  '../validations/deviceValidation';


routes.push({
    method: 'POST',
    path: '/device/register',
    config: {
        description: 'register device',
        notes: 'Once called, when the user opens the app the first time',
        tags: ['api', 'user', 'register', 'device'],
        auth: 'jwt',
        validate: {
            payload: validation.device
        },
        handler: DeviceController.register
    }
});

routes.push({
    method: 'POST',
    path: '/device/unregister',
    config: {
        description: 'unregister device',
        notes: 'Once called, when the user opens the app the first time',
        tags: ['api', 'user', 'register', 'device'],
        auth: 'jwt',
        validate: {
            payload: validation.device
        },
        handler: DeviceController.unregister
     
    }
});



module.exports.routes = routes;
