'use strict';
import * as db from './database';
import * as Joi from 'joi';
import * as util from './util';

const validation: any = {};

validation.bizNearby = Joi.object({
    long: Joi.number().required(),
    lat: Joi.number().required(),
    maxDistance: Joi.number(),
    limit: Joi.number(),
    bizName: Joi.string().allow('')
});

export const getBizNearby = (requestData, done) => {
    Joi.validate(requestData.data, validation.bizNearby, (err, data) => {
        if (err) {
            return util.validationError(err, 'business get service', done);
        }
        let distance = data.maxDistance || 1;
        db.findDataNearby('business', data.long, data.lat, {
                maxDistance: distance / 6371,
                limit: data.limit || 10
            })
            .then(data => {
                done(null, { data: data.results });
            })
            .catch(err => util.serviceError(err, 'business get nearby service', done));
    });
};
