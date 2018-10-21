import { noop } from './util';
import { init_ger } from './helper';
import * as knexhelper from './knex';
const g = require('ger');
var ger;



export const action = (namespace, person, action, thing, dates) => {
    ger.events([{
        namespace: namespace,
        person: person,
        action: action,
        thing: thing,
        expires_at: dates
    }]).then(function () {
        console.log(arguments);
    });
    //fns.getTest();
};

export const actionMultiple = (multipleEvents, next) => {
    let data = multipleEvents.data || multipleEvents;
    next = next || noop;
    ger.events(data)
        .then(resp => next(null, resp))
        .catch(next);
};

export const getTrendingPosts = (request, next) => {
        knexhelper.getTrending("all").then((result) => {
            next(null, result);
        }).catch(next);
};

export const getTrendingPhotos = (request, next) => {
    knexhelper.getTrending("photo").then((result) => {
        next(null, result);
    }).catch(next);
};

export const getTrendingVideos = (request, next) => {
    knexhelper.getTrending("video").then((result) => {
        next(null, result);
    }).catch(next);
};

export const recommendationForPerson = (request, next) => {
    let data = request.data || {};
    ger.recommendations_for_person(data.namespace || 'posts', data.user_id, {
        actions: data.actions || {
            views: 1,
            likes: 1,
            addimpression: 1
        }
    })
        .then(res => next(null, res))
        .catch(next);
};

export const recommendationForThing = (request, next) => {
    let data = request.data || {};
    ger.recommendations_for_thing(data.namespace || 'posts', data.thing_id, {
        actions: data.actions || {
            view: 1,
            likes: 1,
            addimpression: 1
        }
    })
        .then(res => next(null, res))
        .catch(next);
};

export const init = () => {
    ger = init_ger();
    return Promise.all([ger.initialize_namespace('users'), ger.initialize_namespace('events')])
        .then(() => {
            console.log('namespace posts initialized');
        })
};
