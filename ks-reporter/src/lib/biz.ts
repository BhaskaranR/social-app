'use strict';
import * as reporter from './reporter';
import * as knexhelper from './knex';
import * as _ from 'lodash';

import { event_points } from '../model';

export const referBusiness = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'biz' && event.event_name == 'refer' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.bizId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const followBiz = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'biz' && event.event_name == 'follow' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.bizId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const unFollowBiz = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'biz' && event.event_name == 'delete-follow' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.bizId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const addBusiness = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'biz' && event.event_name == 'refer' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.bizId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const addimpression = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'biz' && event.event_name == 'refer' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.bizId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const favorBizPost = (message) => {
    let action = message.data.fileUrl ? 'video' : message.data.photos ? 'photo' : message.data.geotag ? 'geo' : 'text';
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'biz' && event.event_name == 'likes' && event.expired == 0
        }).id

        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.bizId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const unfavorBizPost = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'biz' && event.event_name == 'delete-like' && event.expired == 0
        }).id

        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.bizId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
    console.log('uff, training', message);
};
