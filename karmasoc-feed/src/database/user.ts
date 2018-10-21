import * as util from '../util/util';

import { pact, seneca } from '../setup'

import { User } from '../dbschemas/user';
import { unwrap } from '../util/responseHelper';

var DataLoader = require('dataloader');
var utilities = require('karmasoc-util');
var log = utilities.logger;

export function createLoaders() {
    return {
        getFollowers: new DataLoader(_getFollowers, {
            cache: false
        }),
        getUserDetails: new DataLoader(_getUserDetails, {
            cache: false
        }),
        getAllUserDetails: new DataLoader(_getAllUserDetails, {
            cache: true
        })
    }
}

export function getFollowers(loaders: any, userId: string): Promise<User[]> {
    return loaders.getFollowers.load(userId);
}

export function getUserDetails(loaders: any, userId: string): Promise<User> {
    return loaders.getUserDetails.load(userId);
}

export function getAllUserDetails(loaders: any, userIds: string[]): Promise<User[]> {
    return loaders.getAllUserDetails.load(userIds);
}


function _getFollowers(userId: string[]) {

    let cmdOrMoreComplexObject = {
        cmd: 'getfollowing'
    }
    var request = util.setupSenecaPattern(
        cmdOrMoreComplexObject,
        {
            user_id: userId[0]
        }, {
            role: 'user'
        });

    var resp = pact(request)
        .then((result) => {
            return [unwrap(result) as Array<any>];
        })
        .catch((err) => {
            log.error("error occured", err)
            return [];
        })


    return resp;

}

function _getAllUserDetails(userId: string[]) {
    
        let cmdOrMoreComplexObject = {
            cmd: 'getUser',
            by: 'id'
        }
        var request = util.setupSenecaPattern(
            cmdOrMoreComplexObject,
            {
                user_id: userId
            }, {
                role: 'user'
            });
    
        var resp = pact(request)
            .then((result) => {
                return [unwrap(result) as Array<any>];
            })
            .catch((err) => {
                log.error("error occured", err)
                return [];
            })
    
    
        return resp;
    
    }



function _getUserDetails(userId: string[]) {

    let cmdOrMoreComplexObject = {
        cmd: 'getUser',
        by: 'id'
    }
    var request = util.setupSenecaPattern(
        cmdOrMoreComplexObject,
        {
            user_id: userId[0]
        }, {
            role: 'user'
        });

    var resp = pact(request)
        .then((result) => {
            return [unwrap(result) as Array<any>];
        })
        .catch((err) => {
            log.error("error occured", err)
            return [];
        })


    return resp;

}
