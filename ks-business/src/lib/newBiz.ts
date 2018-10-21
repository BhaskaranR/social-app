'use strict';
import * as db from './database';
import * as Joi from 'joi';
import * as util from './util';

const validation:any  = {};

validation.newBiz = Joi.object({
    referredBy: Joi.string().optional().allow([null, ""]),
    // bizname: Joi.string().required().description('Business type'),
    categoryId: Joi.string().required().description('Category'),
    subcategoryId: Joi.string().optional().allow([null, ""]),
    zipcode: Joi.number().optional().allow([null, ""]),
    address: Joi.string().required(),
    title: Joi.string().required(),
    website: Joi.string().optional().allow([null, ""]),
    geotag: Joi.object().optional().allow([null, ""]),
    userId: Joi.string().required()
});

export const addNewBiz = (requestData, done) => {
    Joi.validate(requestData.data, validation.newBiz, (err, requestData) => { //TODO
        if (err) {
            return util.validationError(err, 'new biz create service', done);
        }

        let biz = util.decorateNewDateData(requestData);

        db.addNewBiz(biz)
            .then(() => done(null, { data: biz }))
            .catch(err => {
                util.serviceError(err, 'new business create service', done);
            });
    });
};