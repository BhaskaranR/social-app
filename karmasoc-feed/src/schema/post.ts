import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

const Coordinates = new GraphQLObjectType({
    name: 'Coordinates',

    fields: () => {
        return {
            lat: {
                type: GraphQLString
            },
            long: {
                type: GraphQLString
            },
        }
    }
})

const GeoTag = new GraphQLObjectType({
    name: 'Geotag',

    fields: () => {
        return {
            type: {
                type: GraphQLString
            },
            coordinates: {
                type: Coordinates
            },
            title: {
                type: GraphQLString
            },
            placeId: {
                type: GraphQLString
            }
        }
    }
})

const getPhotoDetailsFields = () => {
    return {
        xlarge: {
            type: GraphQLString
        },
        large: {
            type: GraphQLString
        },
        normal: {
            type: GraphQLString
        },
        small: {
            type: GraphQLString
        },
        key: {
            type: GraphQLString
        }
    }
}
const PhotoDetails = new GraphQLObjectType({
    name: 'PhotoUrl',

    fields: () => {
        return getPhotoDetailsFields()
    }
})

const AccessType = new GraphQLEnumType({
    name: 'AccessType',

    values: {
        public: {},
        private: {},
        friends: {}
    }
});

const LikeByPost = new GraphQLObjectType({
    name: 'LikePost',

    fields: () => {
        return {
            userId: {
                type: GraphQLString
            },
            like: {
                type: GraphQLString
            }
        }
    }
})

const BookMarkPost = new GraphQLObjectType({
    name: 'BookMarkPost',

    fields: () => {
        return {
            userId: {
                type: GraphQLString
            },
            bookMark: {
                type: new GraphQLList(Bookmark)
            }
        }
    }
})

const Bookmark = new GraphQLEnumType({
    name: 'Bookmark',

    values: {
        mypage: {},
        fun: {},
        learn: {}
    }
})

const PhotoDetailsDb = new GraphQLObjectType({
    name: 'PhotoDetailsDb',

    fields: () => {
        return Object.assign({}, {
            ext: {
                type: GraphQLString
            }
        }, getPhotoDetailsFields())

    }
})

const FileDetails = new GraphQLObjectType({
    name: 'FileDetails',

    fields: () => {
        return {
            id: {
                type: GraphQLString
            },
            ext: {
                type: GraphQLString
            },
            thumbnail: {
                type: PhotoDetailsDb
            }
        }
    }
})

export default new GraphQLObjectType({
    name: 'Post',

    fields: () => {
        return {
            _id: {
                type: GraphQLID
            },
            text: {
                type: GraphQLString
            },
            mentions: {
                type: GraphQLString
            },
            geotag: {
                type: GeoTag
            },
            photos: {
                type: new GraphQLList(PhotoDetails)
            },
            withFriends: {
                type: new GraphQLList(GraphQLString)
            },
            postType: {
                type: GraphQLString
            },
            access: {
                type: AccessType
            },
            userId: {
                type: GraphQLString
            },
            userFirstName: {
                type: GraphQLString
            },
            userLastName: {
                type: GraphQLString
            },
            userImgNormal: {
                type: GraphQLString
            },
            userImgSmall: {
                type: GraphQLString
            },
            shares: {
                type: new GraphQLList(GraphQLString)
            },
            likes: {
                type: new GraphQLList(LikeByPost)
            },
            bookmarks: {
                type: new GraphQLList(BookMarkPost)
            },
            fileUrl: {
                type: new GraphQLList(FileDetails)
            },
            create_date: {
                type: GraphQLString
            },
            modified_date: {
                type: GraphQLString
            }
        }
    }


})  