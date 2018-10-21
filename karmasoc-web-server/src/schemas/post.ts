export default `
type Query {
    feeds(feedType: FeedType, userId: String, offset: Int, limit: Int): [Post]
    postByPostId(postId: String): Post
}

type Coordinates {
    lat: String
    long: String
}

type GeoTag {
    type: String
    coordinates: Coordinates
    title: String
    placeId: String
}

type PhotoUrl {
    xlarge: String
    large: String
    normal: String
    small: String
}

enum AccessType {
    public
    private
    friends
}

type LikeByPost {
    userId: String
    like: String
}

enum Bookmark {
    mypage
    fun
    learn
}


type BookMarkPost {
    userId: String
    bookMark: Bookmark
}

type PhotoDetailsDb {
    ext: String
    xlarge: String
    large: String
    normal: String
    small: String
}

type FileDetails {
    id: String
    ext: String
    thumbnail: PhotoDetailsDb
}

type Post {
    _id: ID
    text: String
    mentions: [String]
    geotag: GeoTag
    photos: [PhotoDetails]
    withFriends: [String]
    postType: String
    access: AccessType
    userId: String
    userFirstName: String
    userLastName: String
    userImgNormal: String
    userImgSmall: String
    shares: [String]
    likes: [LikeByPost]
    bookmarks: [BookMarkPost]
    fileUrl: [FileDetails]
    create_date: String
    modified_date: String
}

enum FeedType {
    Home
    Gallery
    Videos
    TrendingVideos
    TrendingPhotos
    MyFun
    MyLearn
    MyPage
    MyFriendsFun
    MyFriendsLearn
    MyFriendsPage
    MyProfilePage
}

enum ViewType {
    Feed
    Gallery
}`;