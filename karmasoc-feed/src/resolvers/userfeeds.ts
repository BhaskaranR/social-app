import * as _ from 'lodash';

import { getFollowers, getUserDetails, getAllUserDetails } from '../database/user';

import { getTrendingPhotos, getTrendingVideos } from '../database/reporter';

import {
    getFunPostByUserId,
    getGallaryPostByUserId,
    getLearnPostByUserId,
    getMyPagePostByUserId,
    getPostByUserId,
    getAllPostByPostId,
    getPostByUserIdandPostType,
    getPostsById,
    getProfilePostByUserId,
    getPostByPostId
} from '../database/post';

import { FeedType } from '../schema/index';
import { User } from './../dbschemas/user';
import { post } from './../dbschemas/posts';
import { Trendingposts } from '../dbschemas/posts';
import * as config from 'config';


var utilities = require('karmasoc-util');
var log = utilities.logger;

declare type FeedArgs = { feedType: string, userId: string, offset: number, limit: number };

declare type FeedByPostTypeArgs = { postTypes: string[], viewType: string, userId: string, offset: number, limit: number };

declare type PostArgs = { postId: string };

const resolveFunctions: any = {

    RootQuery: {
        feeds(root, { feedType, userId, offset, limit }: FeedArgs, context, info) {
            let currentUserId = userId == '' || userId ? userId : context.requesting_user_id;
            switch (feedType) {
                case 'MyProfilePage':
                    return Promise.all([getUserDetails(context.loaders, currentUserId), getProfilePostByUserId(context.loaders, currentUserId, offset, limit)])
                        .then(resp => enrichPostwithDetails(resp[1], { [resp[0]._id]: resp[0] }))
                        .catch(handleError);

                case "Home":
                    return Promise.all([getUserDetails(context.loaders, currentUserId),
                    getMyFollowers(context.loaders, currentUserId)])
                        .then((userArray) => {
                            return _.flatten(userArray)
                        })
                        .then(users => {
                            let userCol = _.zipObject(users.map(user => user._id), users) as { [userId: string]: User };
                            let posts = getPostByUserId(context.loaders, _.keysIn(userCol), offset, limit)
                            return posts.then(posts => enrichPostwithDetails(posts, userCol));
                        })
                        .catch(handleError);
                case 'TrendingVideos':
                    return getTrendingVideos(context.loaders)
                        .then((posts: Array<Trendingposts>) => {
                            return Promise.all([getAllUserDetails(context.loaders, posts.map(p => p.userId)),
                            getAllPostByPostId(context.loaders, posts.map(pp => pp.postId), offset, limit)]).then(result => {
                                let userCol = _.zipObject(result[0].map(user => user._id), result[0]) as { [userId: string]: User };
                                let posts = result[1];
                                return enrichPostwithDetails(posts, userCol);
                            })
                        })
                        .catch(handleError);
                case 'TrendingPhotos':
                    return getTrendingPhotos(context.loaders)
                        .then((posts: Array<Trendingposts>) => {
                            return Promise.all([getAllUserDetails(context.loaders, posts.map(p => p.userId)),
                            getAllPostByPostId(context.loaders, posts.map(pp => pp.postId), offset, limit)]).then(result => {
                                let userCol = _.zipObject(result[0].map(user => user._id), result[0]) as { [userId: string]: User };
                                let posts = result[1];
                                if (currentUserId && currentUserId !== "")
                                    return enrichPostwithDetails(posts, userCol);
                                else
                                    return posts;
                            })
                        })
                        .catch(handleError);
                case 'Gallery':
                    return Promise.all([getUserDetails(context.loaders, currentUserId),
                    getMyFollowers(context.loaders, currentUserId)])
                        .then((userArray) => {
                            return _.flatten(userArray)
                        })
                        .then(users => {
                            let userCol = _.zipObject(users.map(user => user._id), users) as { [userId: string]: User };
                            let posts = getPostByUserIdandPostType(context.loaders, _.keysIn(userCol), ['Gallery'], offset, limit);
                            return posts.then(posts => enrichPostwithDetails(posts, userCol));
                        })
                        .catch(handleError);
                case 'MyFun':
                    return getFunPostByUserId(context.loaders, [currentUserId], offset, limit)
                        .catch(handleError);

                case 'MyLearn':
                    return getLearnPostByUserId(context.loaders, [currentUserId], offset, limit)
                        .catch(handleError);

                case 'MyPage':
                    return getMyPagePostByUserId(context.loaders, [currentUserId], offset, limit)
                        .catch(handleError);

                case 'MyFriendsFun':
                    return getMyFollowers(context.loaders, currentUserId)
                        .then(users => {
                            let userCol = _.zipObject(users.map(user => user._id), users) as { [userId: string]: User };
                            let posts = getFunPostByUserId(context.loaders, _.keysIn(userCol), offset, limit);
                            return posts.then(posts => enrichPostwithDetails(posts, userCol));
                        })
                        .catch(handleError);

                case 'MyFriendsLearn':
                    return getMyFollowers(context.loaders, currentUserId)
                        .then(users => {
                            let userCol = _.zipObject(users.map(user => user._id), users) as { [userId: string]: User };
                            let posts = getLearnPostByUserId(context.loaders, _.keysIn(userCol), offset, limit);
                            return posts.then(posts => enrichPostwithDetails(posts, userCol));
                        })
                        .catch(handleError);

                case 'MyFriendsPage':
                    return getMyFollowers(context.loaders, currentUserId)
                        .then(users => {
                            let userCol = _.zipObject(users.map(user => user._id), users) as { [userId: string]: User };
                            let posts = getMyPagePostByUserId(context.loaders, _.keysIn(userCol), offset, limit);
                            return posts.then(posts => enrichPostwithDetails(posts, userCol));
                        })
                        .catch(handleError);


                default:
                    throw new Error("Invalid feed type");
            }

        },
        postByPostId(root, { postId }: PostArgs, context, info) {
            let currentUserId = context.requesting_user_id;
            return Promise.all([getUserDetails(context.loaders, currentUserId),
            getMyFollowers(context.loaders, currentUserId)])
                .then((userArray) => {
                    return _.flatten(userArray)
                })
                .then(users => {
                    let userCol = _.zipObject(users.map(user => user._id), users) as { [userId: string]: User };
                    let posts = getPostByPostId(context.loaders, postId);
                    return posts.then(posts => enrichPostwithDetails([posts], userCol));
                })
                .catch(handleError);
        }
    }
}


function getMyFollowers(loaders: any, userId: string) {
    return getFollowers(loaders, userId);
}


function enrichPostwithDetails(posts: post[], usersMap: { [userId: string]: User }) {
    return posts.map(post => {
        const p = _.assign({
            userFirstName: usersMap[post.userId].firstName,
            userLastName: usersMap[post.userId].lastName,
            userImgNormal: usersMap[post.userId].images.normal ? usersMap[post.userId].images.normal.replace('thumborserver', config.get("thumbor.server")) : null,
            userImgSmall: usersMap[post.userId].images.small ? usersMap[post.userId].images.small.replace('thumborserver', config.get("thumbor.server")) : null
        }, post);
        if (p.photos) {
            p.photos = p.photos.map(pp => {
                return Object.assign({}, pp, {
                    xlarge: pp.xlarge.replace('thumborserver', config.get("thumbor.server")),
                    large: pp.large.replace('thumborserver', config.get("thumbor.server")),
                    normal: pp.normal.replace('thumborserver', config.get("thumbor.server")).replace('/480x270', '/530x0'),
                    small: pp.small.replace('thumborserver', config.get("thumbor.server")).replace('/250x0', '/330x0')
                })
            })
        }
        return p;
    })
}


function handleError(e: Error) {
    log.error("An error occurred while processing feed", e);
    throw e;
    //throw new Error("An error occurred. Please try again.")
}
export default resolveFunctions;