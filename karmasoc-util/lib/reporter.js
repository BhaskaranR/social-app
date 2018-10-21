'use strict';

const fns = {};

const noop = () => {};


fns.report = function(msg, next) {
    this.prior(msg, (nn, response) => {
        msg.origin_role = msg.role;
        msg.role = 'reporter';
        msg.data = response.data;
        try {
            this.fire(msg, null);
        } catch (e) {}
        next(null, response);
    });

};

module.exports = fns;