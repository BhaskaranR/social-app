/* tslint:disable */
export default  `
type Mutation {
    sendComment(postId: String!, content: String!): Comment
    #deleteComment(commentId: CommentIdentifier!): Boolean
    #editComment(commentId: CommentIdentifier!, content: String!): Comment
    #addReactionToComment(commentId: CommentIdentifier!, icon: String!): Comment
}

type Query {
    comments(postId: String,  cursor: String, count: Int, searchRegex: String): CommentsWithCursor
}

type Subscription {
    newComment(postId: String!): Comment
} 


type CommentsWithCursor {
  cursor: String
  post: Post
  commentsArray: [Comment]
}

type Comment {
    id: String
    author: User
    content: String
    creationTime: String
    post: Post
    fromServer: Boolean #when user joins a post we get a message from server - text is grey
    tags: [String]
    userRef: [User]
    postRef: [Post]
    reactions: [Reaction]
}

input CommentIdentifier {
    postId: String!
    commentId: String!
}

`;
