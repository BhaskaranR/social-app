import { User } from '../../dbschemas/user';
import { post } from '../../dbschemas/posts';
import * as config from 'config';
import * as _ from 'lodash';


export function enrichPostwithDetails(posts: post[], usersMap: { [userId: string]: User }) {
    return posts.map(post => {
        if (usersMap[post.userId]) {
        const p = _.assign({
            userFirstName: usersMap[post.userId].firstName,
            userLastName: usersMap[post.userId].lastName,
            userImgNormal: usersMap[post.userId].images.normal ? usersMap[post.userId].images.normal.replace('thumborserver', config.get("thumbor.server")) : null,
            userImgSmall: usersMap[post.userId].images.small ? usersMap[post.userId].images.small.replace('thumborserver', config.get("thumbor.server")) : null
        }, post);
        if (p.photos) {
            p.photos = p.photos.map(pp => {
                return (<any>Object).assign({}, pp, {
                    xlarge: pp.xlarge.replace('thumborserver', config.get("thumbor.server")),
                    large: pp.large.replace('thumborserver', config.get("thumbor.server")),
                    normal: pp.normal.replace('thumborserver', config.get("thumbor.server")).replace('/480x270', '/530x0'),
                    small: pp.small.replace('thumborserver', config.get("thumbor.server")).replace('/250x0', '/330x0')
                })
            })
        }
        return p;}
    })
}


export function handleError(e: Error) {
    log.error("An error occurred while processing feed", e);
    throw e;
    //throw new Error("An error occurred. Please try again.")
}