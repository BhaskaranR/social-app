'use strict';
import * as Joi from 'joi';

export const filterImage = Joi.object().keys({
    clientId: Joi.string().required(),
    key: Joi.string().required(),
    blend: Joi.string().optional(),
    blur: Joi.number().optional(),
    hueRotate: Joi.number().optional(),
    invert: Joi.number().optional(),
    grayScale: Joi.number().optional(),
    saturate: Joi.number().optional(),
    brightness: Joi.number().optional(),
    contrast: Joi.number().optional()
});