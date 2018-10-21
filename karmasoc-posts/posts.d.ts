
export enum like{
    like,
    dislike,
    neutral
}

export enum postType{
    text,
    image,
    audio,
    video,
    geotag
}


export enum accessType{
    public,
    private,
    friends
}

export enum bookmark{
    mypage,
    fun,
    learn
}

export interface geomap{
    type : string;
    coordinates: {lat: string, long: string},
    city : {title: string, placeId: string}
}

export interface fileUrl {
    id : string;
    name: string;
}

export interface post
{
    text?: string;
    geomap?: geomap;
    videoUrl?: string;
    audioUrl?: string;
    photos?: photoUrl[];
    withFriends?: string[];
    postType?: postType;
    access?: accessType;
    userId: string;
    shares?: string[];
    likes?: string[]
    bookmarks?: bookmark[]
    fileUrl? : fileUrl
}

export interface postdb{
    text?: string;
    geomap?: geomap;
    fileUrl?: {id: string, name: string};
    photos?: photoUrlDb[];
    withFriends?: string[];
    postType?: postType;
    access?: accessType;
    userId: string;
    shares?: string[];
    likes?: string[]
    bookmarks?: bookmark[]
}

export interface sharePost{
    userId: string;
    postId: string;
    impression: impression;
}

export interface impression{
    id: string;
    postId: string;
    text: string;
    imageUrl: photoUrl;
    videoUrl: string;
    userId: string;
}

export interface photoUrl{
    xlarge: string;
    large: string;
    normal: string;
    small:  string;
}


export interface photoUrlDb extends  photoUrl{
    name: string;
    path: string;
}

export interface UserPostService{
    //post and comment
    addPost(post: post) : post;
    editPost(post: post) : boolean;
    deletePost(postId : string) : boolean;
    favorPost(postId : string, like : like): boolean;
    postImpression(postId: string, impression: impression): boolean;
    editImpression(impression: impression) : boolean;
    deleteImpression(impressionId: string) : boolean;
    //bookmark
    addPostWithBookMark(post: post, bookMark: bookmark[]) : post;
    bookMarkPost(post:number, bookMark:bookmark[]);
    //retrieval
    getPostsForUser(userId: string,  index : number, count : number, bookMark?: bookmark) : post[];//pagination
    getImagePostsForUser(userId: string, index : number, count : number, bookMark?: bookmark): post[];
    getVideoPostsForUser(userId: string, index : number, count : number, bookMark?: bookmark): post[];
    getImpressionsForPost(postId: string, index : number, count) : impression[]; //pagination
    getTrendingPosts(index : number, count : number, bookMark?: bookmark): post[];
    getTrendingImages(index : number, count : number, bookMark?: bookmark): post[];
    getTrendingVideos(index : number, count : number, bookMark?: bookmark): post[];
    //share posts
    sharePost(post: sharePost): post;
    shareToFaceBook(post: post); //enabled
    shareToGooglePlus(post:post);
    //notify posts
    notifyPosts(userId : string): post;//socket.io implementation will do it.. next phase
}