'use strict';

//const ObjectID = require('mongodb').ObjectID;



/*fns.safeObjectId = (objectIdString, idType) => {

    idType = idType || 'id';

    return new Promise((resolve) => {
        resolve(new ObjectID(objectIdString));

    }).catch(() => {
        throw new Error('Invalid ' + idType);
    });
};
*/

export const noop = () => {
    console.log('info: no implementation found');
};
