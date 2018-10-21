import { GraphQLEnumType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import PostType from './post';

export var FeedType = new GraphQLEnumType({
    name: 'FeedType',
    values: {
        Home: {},
        Gallery: {},
        Videos:  {},
        TrendingVideos: {},
        TrendingPhotos: {},
        MyFun: {},
        MyLearn: {},
        MyPage: {},
        MyFriendsFun: {},
        MyFriendsLearn: {},
        MyFriendsPage: {},
        MyProfilePage: {}
    }
});

export var ViewType = new GraphQLEnumType({
    name: 'ViewType',
    values: {
        Feed: {},
        Gallery: {},
    }
});

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: () => ({
        feeds: {
            type: new GraphQLList(PostType),
            description: 'The current user identified by an api key',
            args: {
                'feedType': {
                    type: FeedType
                },
                'userId': {
                    type: GraphQLString,
                    defaultValue: ''
                },
                'offset': {
                    type: GraphQLInt,
                    defaultValue: 0
                },
                'limit': {
                    type: GraphQLInt,
                    defaultValue: 10
                }
            }
        },
       /* feedsByPostTypes: {
            type: new GraphQLList(PostType),
            description: 'The current user identified by an api key',
            args: {
                'postTypes': {
                    type: new GraphQLList(GraphQLString)
                },
                'viewType': {
                    type: new GraphQLList(ViewType),
                },
                'userId': {
                    type: GraphQLString,
                    defaultValue: ''
                },
                'offset': {
                    type: GraphQLInt,
                    defaultValue: 0
                },
                'limit': {
                    type: GraphQLInt,
                    defaultValue: 10
                }
            }

        },*/
        postByPostId: {
            type: new GraphQLList(PostType),
            description: 'The current post id identified by an api key',
            args: {
                'postId': {
                    type: GraphQLString,
                    defaultValue: ''
                }
            }

        }
    })
});


const ncSchema = new GraphQLSchema({
    query: RootQueryType
});

export default ncSchema;