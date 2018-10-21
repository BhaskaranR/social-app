'use strict';
import * as Joi from "joi";
import DeviceRepository from "./mongoDevice"
import { IDevice } from "./interfaces";
const validation = require('../validations/validation');

const util = require('../util/util');

export default class Device {

    static registerDevice(message, next) {
        Joi.validate(message.data, validation.registerDevice, (err, data) => {
            if (err) {
                return util.validationError(err, 'register device service', next);
            }
            let db = new DeviceRepository();
            db.upsertDevice(data)
                .then(() => {
                    console.log("response sending");
                    console.log({ data: { deviceId: message.data.subscription } });
                    return next(null, { data: { deviceId: message.data.subscription } });
                })
                .catch(err => util.serviceError(err, 'register device service', next));
        });
    }

    static unregisterDevice(message, next) {
        Joi.validate(message.data, validation.unregisterDevice, (err, data) => {
            if (err) {
                return util.validationError(err, 'unregister device service', next);
            }
            let db = new DeviceRepository();
            db.deactivateDevice(data.user_id, data, next);
        });
    }

    static getPushToken(message, next) {
        Joi.validate(message.data, validation.idArray, (err, data) => {

            if (err) {
                return util.validationError(err, 'get push token service', next);
            }

            let db = new DeviceRepository();
            db.getPushTokenFromUser(data.user_ids)
                .then(tokens => next(null, { data: tokens }))
                .catch(err => util.serviceError(err, 'get push token service', next));

        });
    }

}