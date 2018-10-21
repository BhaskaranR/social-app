'use strict';
import * as db from './database';
import * as Joi from 'joi';
import * as moment from 'moment';
import * as util from './util';
import { validation } from './validation';

export const addpromoBiz = (requestData, done) => {
    Joi.validate(requestData.data, validation.geobiz, (err, data) => {

        if (err) {
            return done(err);
        }
        let now = moment();

        let geobizData = {
            geotag: {
                coordinates: [data.long, data.lat],
                type: 'Point'
            },
            create_date: now.toISOString(),
            modified_date: now.toISOString(),
            hour: now.hour()
        };

        db.addPromoBiz(geobizData)
            .then(() => done(null, geobizData))
            .catch(done);
    });
};


export const getPromoBizNearby = (requestData, done) => {
    Joi.validate(requestData.data, validation.geobizNearby, (err, data) => {

        if (err) {
            return done(err);
        }

        let now = moment();
        let twoHoursAgo = now.subtract(2, 'h').hour();
        let twoHoursFromNow = now.add(2, 'h').hour();

        db.findDataNearby('geobiz', data.long, data.lat, {
                maxDistance: data.maxDistance / 6371,
                limit: data.limit || 10,
                query: {
                    $and: [
                        { hour: { $gte: twoHoursAgo } },
                        { hour: { $lte: twoHoursFromNow } }
                    ]
                }
            })
            .then(result => {
                done(null, { data: result.results });
            })
            .catch(done);
    });
};
