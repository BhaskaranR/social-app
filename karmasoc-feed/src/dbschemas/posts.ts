export interface Trendingposts {
    postId: string;
    userId: string;
    oldinweeks: number;
    score: number;
}

export enum like {
    like,
    dislike,
    neutral
}

export enum postType {
    text,
    file,
    geotag
}


export enum accessType {
    public,
    private,
    friends
}

export enum bookmark {
    mypage,
    fun,
    learn
}

export interface geotag {
    type: string;
    coordinates: { lat: string, long: string };
    title: string;
    placeId: string;
}

export interface fileDetails {
    id: string;
    ext: string;
    thumbnail: photoDetailsDb
}

export interface likes {
    userId: string;
    like: string;
}

export interface post {
    text?: string;
    mentions: string;
    geotag?: geotag;
    photos?: photoDetails[];
    withFriends?: string[];
    postType?: string;
    access?: accessType;
    userId: string;
    shares?: string[];
    likes?: [likes];
    bookmarks?: bookMarkPost[]
    fileUrl?: fileDetails[]
}

export interface postdb {
    text?: string;
    mentions?: string;
    geotag?: geotag;
    fileUrl?: { id: string, name: string };
    photos?: photoDetailsDb[];
    withFriends?: string[];
    postType?: postType;
    access?: accessType;
    userId: string;
    shares?: string[];
    likes?: string[]
    bookmarks?: bookmark[]
}

export interface bookMarkPost {
    userId: string;
    bookMark: bookmark[];
}

export interface sharePost {
    userId: string;
    postId: string;
    impression: impression;
}

export interface impression {
    id: string;
    postId: string;
    text: string;
    imageUrl: photoDetails;
    videoUrl: string;
    userId: string;
}

export interface photoDetails {
    xlarge: string;
    large: string;
    normal: string;
    small: string;
    key: string;
}


export interface photoDetailsDb extends photoDetails {
    ext: string;
}

export interface UserPostService {
    //post and comment
    addPost(post: post): post;
    editPost(post: post): boolean;
    deletePost(postId: string): boolean;
    favorPost(postId: string, like: like): boolean;
    postImpression(postId: string, impression: impression): boolean;
    editImpression(impression: impression): boolean;
    deleteImpression(impressionId: string): boolean;
    //bookmark
    addPostWithBookMark(post: post, bookMark: bookmark[]): post;
    bookMarkPost(post: number, bookMark: bookmark[]);
    //retrieval
    getPostsForUser(userId: string, index: number, count: number, bookMark?: bookmark): post[];//pagination
    getImagePostsForUser(userId: string, index: number, count: number, bookMark?: bookmark): post[];
    getVideoPostsForUser(userId: string, index: number, count: number, bookMark?: bookmark): post[];
    getImpressionsForPost(postId: string, index: number, count): impression[]; //pagination
    getTrendingPosts(index: number, count: number, bookMark?: bookmark): post[];
    getTrendingImages(index: number, count: number, bookMark?: bookmark): post[];
    getTrendingVideos(index: number, count: number, bookMark?: bookmark): post[];
    //share posts
    sharePost(post: sharePost): post;
    shareToFaceBook(post: post); //enabled
    shareToGooglePlus(post: post);
    //notify posts
    notifyPosts(userId: string): post;//socket.io implementation will do it.. next phase
}