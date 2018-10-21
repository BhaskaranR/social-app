'use strict';
import * as _ from 'lodash';
import * as util from './util';
import * as db from './database';
import * as Joi from 'joi';

const validation: any = {};

validation.bizsubcategory = Joi.object({
    category_id: Joi.string().required()
});

var bizlookupdata;
var subcategorydata = {};

export const getBizLookup = (requestData, done) => {
    if (bizlookupdata)
        return done(null, { data: bizlookupdata });;
    db.getAllBizCategories()
        .then(data => {
            bizlookupdata = _.groupBy((data, categories) => categories.bizname);
            done(null, { data: bizlookupdata });
        })
        .catch(err => util.serviceError(err, 'business get all categories', done));
};

export const getBizSubCategories = (requestData, done) => {
    Joi.validate(requestData.data, validation.bizsubcategory, (err, data) => {
        if (err) {
            return util.validationError(err, 'business get all subcategories', done);
        }
        if (subcategorydata[data.category_id]) return done(null, { data: subcategorydata[data.category_id] });
        db.getSubcategories(data.category_id, 'subcategories')
            .then(res => {
                subcategorydata[data.category_id] = res;
                done(null, { data: subcategorydata[data.category_id] });
            })
            .catch(done);
    });
};
