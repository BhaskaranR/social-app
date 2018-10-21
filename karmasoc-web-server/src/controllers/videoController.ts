
'use strict';
import * as Hapi from "hapi";
const log = require('karmasoc-util').logger;
var config = require('config');

export default class VideoController {


    static getBitMovinKey(request, reply) {
        let key = config.get("bitmovinKey");
        reply(key);
    }
}