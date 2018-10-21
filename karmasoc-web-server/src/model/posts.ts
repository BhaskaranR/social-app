export interface PhotoDetails {
    key: string;
    xlarge: string;
    large: string;
    normal: string;
    small: string;
    ext: string;
}

export enum like {
    like,
    dislike,
    neutral
}

export type feedsRequest = { feedtype: string, userid: string, offset: number, limit: number };

export type feedsRequestWithTypes = { postTypes: string[], userid: string, offset: number, limit: number };


export interface favor {
    postId: string;
    favor: string
}

export interface favoredBy extends favor {
    userId: string;
    userFirstName: string;
    userLastName: string;
    userImgNormal: string;
    userImgSmall: string;
}

export enum PostType {
    text,
    file,
    geotag
}

export enum AccessType {
    public,
    private,
    friends
}

export enum Bookmark {
    mypage,
    fun,
    learn
}

export interface Geotag {
    type: string;
    coordinates: { lat: string, long: string };
    title: string;
    placeId: string;
}

export interface FileDetails {
    id: string;
    //name: string;
    thumbnail: PhotoDetails;
}

export interface PostInput {
    clientId: string;
    text: string;
    geotag: Geotag;
    mentions: string[];
    bizId?: string;
}



export interface Post {
    _id?: string;
    bizId?: string;
    text?: string;
    geotag?: Geotag;
    photos?: PhotoDetails[];
    withFriends?: string[];
    postType?: string;
    access?: AccessType;
    shares?: string[];
    mentions?: string;
    likes?: { userId: string, like: string }[];
    userId?: string;
    userFirstName?: string;
    userLastName?: string;
    userImgNormal?: string;
    userImgSmall?: string;
    bookmarks?: { userId: string, bookMark: Bookmark[] };
    fileUrl?: FileDetails[];
    comments?: postComment[];
    contentLoaded?: boolean,
    loadedAfterBootstrap?: boolean,
    featured?: boolean
    modified_date?: string;
    create_date?: string;
}


export interface postComment {
    _id: string;
    postId: string;
    text?: string;
    photos?: PhotoDetails[];
    withFriends?: string[];
    postType?: string;
    mentions?: string;
    likes?: string[];
    userId: string;
    userFirstName?: string;
    userLastName?: string;
    userImgNormal?: string;
    userImgSmall?: string;
    fileUrl?: FileDetails[];
    modified_date?: string;
    create_date?: string;
}


export interface Posts {
    ids: string[],
    entities: { [id: string]: Post };
    selectedPostId: string | null,
    loadingPostPreviews: boolean,
    currentAPIPage: number,
    allPostPreviewsLoaded: boolean
}

export interface SharePost {
    userId: string;
    postId: string;
    impression: Impression;
}

export interface Impression {
    id: string;
    postId: string;
    text: string;
    imageUrl: PhotoDetails;
    videoUrl: string;
    userId: string;
}

export interface Favorites {
    favorites: number;
    added: boolean;
    updated: boolean;
    removed: boolean;
};
