'use strict';
import * as reporter from './reporter';
import * as knexhelper from './knex';
import { event_points } from '../model';
import * as _ from 'lodash';

/*
fns.register = (requestData, done) => {
    database.event(message.data._id, 'user', 'register', null, message.data._id)
};

fns.login = (requestData, done) => {
    database.event(message.data._id, 'user', 'login', null, message.data._id)
};
*/

export const follow = (message, done) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'user' && event.event_name == 'follow' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.follow_id).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const unfollow = (message, done) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'user' && event.event_name == 'delete-follow' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.follow_id).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const refer = (message, done) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'user' && event.event_name == 'refer' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.user_id).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};
