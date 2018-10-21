import { User } from '../dbschemas/user';
import * as _ from 'lodash';

import { pubsub, CHAT_MESSAGE_SUBSCRIPTION_TOPIC } from '../setup/graphql';
import { withFilter } from 'graphql-subscriptions';
import { pact } from '../server';
import { unwrap } from '../util/responseHelper';
import { getUserDetails, getFollowers } from '../database/user';
import { getPostByPostId, sendComments } from '../database/post';
import { enrichPostwithDetails, handleError } from './common';

export default {
    Subscription: {
        newComment: {
            subscribe: withFilter(() => pubsub.asyncIterator(CHAT_MESSAGE_SUBSCRIPTION_TOPIC), (payload, args) => {
                return payload.chatMessageAdded.channel.id === args.channelId;
            })
        }
    },
    Query: () => ({
        comments: (root, { postId, cursor, count }, context) => {
            if (!postId) {
                console.error(`messages query must be called with postId or postDetails`);
                return null;
            }
            let currentUserId =  context.requesting_user_id;
            return Promise.all([getUserDetails(context.loaders, currentUserId),
                getFollowers(context.loaders, currentUserId)])
                    .then((userArray) => {
                        return _.flatten(userArray);
                    })
                    .then(users => {
                        let userCol =  _.zipObject(users.map(user => user._id), users) as {
                            [userId: string]: User;
                        };;
                        let posts = getPostByPostId(context.loaders, postId);
                        return posts.then(posts => enrichPostwithDetails([posts], userCol));
                    })
                    .catch(handleError);
            
        },
    }),
    Mutation: () => ({
        sendComment: (root, { postId, content }, { context }) => {
            const newMessage = {
                content,
                user_id: context.requesting_user_id,
                post_id: postId
            };
            sendComments(newMessage);
        }
    })
};