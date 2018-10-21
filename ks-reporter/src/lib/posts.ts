'use strict';
import * as reporter from './reporter';
import * as _ from 'lodash';
import * as knexhelper from './knex';
import { event_points } from '../model';


let getExpireDate = (years) => {
    return new Date(Date.now() + 31536000 * 1000 * years || 1);
};

export const newPost = (message) => {
    let action = message.data.fileUrl ? 'video' : message.data.photos ? 'photo' : 'text';
    knexhelper.getEvents().then((events: event_points[]) => {
        let event = _.find(events, (event) => {
            return event.event_subcategory == action && event.event_category == 'post' && event.event_name == 'create' && event.expired == 0
        })
        knexhelper.calculateRewards(message.requesting_user_id,  event.id, message.data._id).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const deletePost = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'post' && event.event_name == 'delete' && event.expired == 0
        }).id

        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.postId).then((result) => {
            console.dir(result, {depth: null});
        });

        //knexhelper.event(message.requesting_user_id, event.id, message.data._id).then((val: any[]) => {
        //    const eventId = val[0];
        //    knexhelper.rewardPoint(message.requesting_user_id, eventId, event.reward_type, event.reward_value);
        // })
        // knexhelper.event(message.requesting_user_id, eventId, message.data._id)
    });
};

export const getPost = (message) => {
    reporter.action('posts', message.requesting_user_id, 'views', message.data._id, getExpireDate(2));
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'post' && event.event_name == 'delete' && event.expired == 0
        }).id

        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data._id).then((result) => {
            console.dir(result, {depth: null});
        });
    });
};

export const favorPost = (message) => {
    let action = message.data.fileUrl ? 'video' : message.data.photos ? 'photo' : message.data.geotag ? 'geo' : 'text';
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'post' && event.event_name == 'like' && event.expired == 0
        }).id

        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.postId).then((result) => {
            console.dir(result, {depth: null});
        });
    });

    //knexhelper.event(message.requesting_user_id, 'post', 'likes', null, message.data.postId)
};

export const unfavorPost = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'post' && event.event_name == 'delete-like' && event.expired == 0
        }).id

        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.postId).then((result) => {
            console.dir(result, {depth: null});
        });
    });
    console.log('uff, training', message);
    // knexhelper.event(message.requesting_user_id, 'post', 'likes', null, message.data.postId)
};

export const addimpression = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'post' && event.event_name == 'comment' && event.event_subcategory == 'text' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.postId).then((result) => {
            console.dir(result, {depth: null});
        });

    });
    // reporter.action('posts', message.requesting_user_id, 'comments', message.data.postId, getExpireDate(4));
};

export const deleteImpression = (message) => {
    knexhelper.getEvents().then((events: event_points[]) => {
        let eventId = _.find(events, (event) => {
            return event.event_category == 'post' && event.event_name == 'delete-comment' && event.event_subcategory == 'text' && event.expired == 0
        }).id
        knexhelper.calculateRewards(message.requesting_user_id,  eventId, message.data.postId).then((result) => {
            console.dir(result, {depth: null});
        });

    });
};
