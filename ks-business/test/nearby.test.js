'use strict';
import test from 'ava';
const proxyquire = require('proxyquire');

const databaseStub = require('./stubs/database.stub');
const nearby = proxyquire('../lib/nearby', { './database': databaseStub });

test('getBizNearby - totally wrong input data', t => {
    nearby.getBizNearby({ data: { crap: 'crappapa', bla: 'random' } }, (err, data) => {
        t.is(void 0, data);
        t.is('ValidationError', err.name);
    });
});

test('getBizNearby - right keys wrong datatypes', t => {
    nearby.getBizNearby({ data: { lat: 'crappapa', long: 'random', options: {} } }, (err, data) => {
        t.is(void 0, data);
        t.is('ValidationError', err.name);
    });
});

test('getBizNearby - correct datatypes', t => {
    nearby.getBizNearby({ data: { lat: 123, long: 3 } }, (err, data) => {
        t.not(void 0, data);
        t.is(null, err);
    });
});


test('getBizNearby - corrupt maxLength', t => {
    nearby.getBizNearby({ data: { lat: 123, long: 3, maxLength: 'not a number' } }, (err, data) => {
        t.is(void 0, data);
        t.is('ValidationError', err.name);
    });
});

test('getBizNearby - corrupt limit', t => {
    nearby.getBizNearby({ data: { lat: 123, long: 3, limit: 'not a number' } }, (err, data) => {
        t.is(void 0, data);
        t.is('ValidationError', err.name);
    });
});