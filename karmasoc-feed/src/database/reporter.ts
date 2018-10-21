import * as util from '../util/util';
import { pact, seneca } from '../setup'
import { User } from '../dbschemas/user';
import { unwrap } from '../util/responseHelper';
import { Trendingposts } from '../dbschemas/posts';

var DataLoader = require('dataloader');
var utilities = require('karmasoc-util');
var log = utilities.logger;

export function createLoaders() {
    return {
        getTrendingVideos: new DataLoader(_getTrendingVideos, {
            cache: true
        }),
        getTrendingPhotos: new DataLoader(_getTrendingPhotos, {
            cache: true
        })
    }
}

export function getTrendingVideos(loaders: any): Promise<Trendingposts[]> {
    return loaders.getTrendingVideos.load();
}

export function getTrendingPhotos(loaders: any): Promise<Trendingposts[]> {
    return loaders.getTrendingPhotos.load();
}



function _getTrendingVideos() : Array<Trendingposts> {
    let cmdOrMoreComplexObject = {
        cmd: 'getTrendingVideos'
    }
    var request = util.setupSenecaPattern(
        cmdOrMoreComplexObject,
        {
        }, {
            role: 'reporter'
        });
    var resp = pact(request)
        .then((result) => {
            return [unwrap(result) as Array<Trendingposts>];
        })
        .catch((err) => {
            log.error("error occured", err)
            return [];
        })
    return resp;
}

function _getTrendingPhotos(userId: string[]) : Array<Trendingposts> {
    let cmdOrMoreComplexObject = {
        cmd: 'getTrendingPhotos'
    }
    var request = util.setupSenecaPattern(
        cmdOrMoreComplexObject,
        {
        }, {
            role: 'reporter'
        });

    var resp = pact(request)
        .then((result) => {
            return [unwrap(result) as Array<Trendingposts>];
        })
        .catch((err) => {
            log.error("error occured", err)
            return [];
        })
    return resp;
}