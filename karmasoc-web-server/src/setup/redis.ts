// instantiate redis-connection
const redisClient = require('../session/session')();
export const validate = (decoded, request, callback) => {
    redisClient.get(decoded._id, function (rediserror, reply) {
        if (rediserror) {
            console.log(rediserror);
            return callback(rediserror, false);
        }
        if (!reply) {
            return callback(rediserror, false);
        }
        let session = JSON.parse(reply);
        //check if session valid todo
        if (session.valid === false) {
            return callback("session not found", false);
        } else {
            return callback(rediserror, true);
        }
    });
};