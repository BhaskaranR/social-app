'use strict';
import * as Joi from 'joi';


export const device = Joi.object().keys({
    endpoint: Joi.string().required(),
    expirationTime: Joi.string().allow(null),
    keys: Joi.object().keys(
        {
            auth: Joi.string().required(),
            p256dh: Joi.string().required()
        }
    )
});
