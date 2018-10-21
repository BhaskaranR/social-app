'use strict';
import * as Joi from 'joi';

export const getFile = Joi.object().keys({
    fileId: Joi.string().required(),
//    name: Joi.string().required(),
    ext: Joi.string().required()
});