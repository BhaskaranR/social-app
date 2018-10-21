
import { createLoaders as postLoader } from './post'
import { createLoaders as userLoader } from './user'

export function createLoaders() {

    return Object.assign({}, 
                postLoader(),
                userLoader());
}