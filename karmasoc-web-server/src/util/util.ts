'use strict';
import * as _ from 'lodash';
const hoek = require('hoek');
const log = require('karmasoc-util').logger;

/**
 * build a seneca command pattern for seneca.act
 * @param cmdOrMoreComplexObject {string|object} name of cmd or object
 * @param data {object} data object to attach to the data property
 * @param basicPin {object} role object
 * @returns {object}
 */
export const setupSenecaPattern = (cmdOrMoreComplexObject, data, basicPin) => {
    let requestPattern : any = {};
    if (typeof cmdOrMoreComplexObject === 'string') {
        requestPattern.cmd = cmdOrMoreComplexObject;
    } else {
        requestPattern = cmdOrMoreComplexObject;
    }
    requestPattern.data = data;
    return hoek.merge(requestPattern, basicPin);
};

export const clone = hoek.clone;

export const getSessionId = requestAuth => {
        log.info("credentials: " + requestAuth.credentials);    
        if (requestAuth.credentials && requestAuth.credentials.length >1) {
            let flattArr : any[] = _.flattenDeep(requestAuth.credentials);
            return flattArr[0]._id;
        }
        log.info('getuserId');
        return requestAuth.credentials && requestAuth.credentials._id ? requestAuth.credentials._id : 'unknown';
    };

/**
 * helper to extract the userid from request.auth
 * @param requestAuth {object} request.auth from hapis route handler
 * @returns {string} userid (_id) or unknown if not authenticated
 */
export const getUserId = requestAuth => {
    log.info("credentials: " + requestAuth.credentials);
    if (requestAuth.credentials && requestAuth.credentials.length >1 ) {
        let flattArr : any[] = _.flattenDeep(requestAuth.credentials);
        return flattArr[0].user_id;
    }
    log.info('getuserId');
    return requestAuth.credentials && requestAuth.credentials.user_id ? requestAuth.credentials.user_id : 'unknown';
};

/**
 * helper to extract the device from request.state
 * @param requestState {object} request.state from hapis route handler
 * @returns {string} device ID (device_id) or unknown if there is no cookie
 */
export const getDeviceId = requestState => {
    log.info('getdeviceId');
    return requestState['karmasoc'] && requestState['karmasoc'].device_id ? requestState['karmasoc'].device_id : 'unknown';
};

