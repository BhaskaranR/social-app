'use strict';
import test from 'ava';

const util = require('../lib/util');

test('decorateNewDateData', t => {
    let target = {
        data: {
            crap: 'asdf',
            bla: 'random'
        }
    };
    util.decorateNewDateData(target);
    t.ok(target.create_date && target.modified_date);
});

test('util.updateModifiedDate', t => {
    let target = {
        data: {
            crap: 'asdf',
            bla: 'random'
        }
    };

    util.updateModifiedDate(target);
    t.ok(target.$currentDate.modified_date);
});