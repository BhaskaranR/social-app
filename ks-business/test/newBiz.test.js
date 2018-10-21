'use strict';
import test from 'ava';
const proxyquire = require('proxyquire');

const databaseStub = require('./stubs/database.stub');
const newLoc = proxyquire('../lib/newBiz', { './database': databaseStub });

test('addNewBiz-with crappy data', t => {
    newLoc.addNewBiz({ data: { crap: 'crappapa', bla: 'random' } }, (err, data) => {
        t.is(void 0, data);
        t.is('ValidationError', err.name);
    });
});