
import { createLoaders as postLoader } from './post'
import { createLoaders as userLoader } from './user'
import { createLoaders as reporterLoader } from './reporter'



export function createLoaders() {
    return (<any>Object).assign({}, 
                postLoader(),
                userLoader());
}