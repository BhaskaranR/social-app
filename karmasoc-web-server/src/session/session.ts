//https://github.com/dwyl/redis-connection
import * as redis from 'redis';
var url = require('url');
var config = require("config");
var rc; // redis config
if (config.has("redisCloudUrl")) {
    var redisURL = url.parse(config.get("redisCloudUrl"));
    rc = {
        port: redisURL.port,
        host: redisURL.hostname,
        auth: redisURL.auth.split(":")[1]
    };
}
var CON = {}; // store redis connections as Object
function new_connection() : redis.RedisClient {
    var redis_con = redis.createClient(rc.port, rc.host);
    redis_con.auth(rc.auth);
    return redis_con;
}
function redis_connection(type) : redis.RedisClient {
    type = type || 'DEFAULT'; // allow infinite types of connections
    if (!CON[type] || !CON[type].connected) {
        CON[type] = new_connection();
    }
    return CON[type];
}
module.exports = redis_connection;
module.exports.kill = function (type) {
    type = type || 'DEFAULT'; // kill specific connection or default one
    CON[type].end();
    delete CON[type];
};
module.exports.killall = function () {
    var keys = Object.keys(CON);
    keys.forEach(function (k) {
        CON[k].end();
        delete CON[k];
    });
};

//# sourceMappingURL=session.js.map
