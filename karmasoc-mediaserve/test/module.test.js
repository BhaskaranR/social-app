'use strict';
import test from 'ava';
const proxyquire =  require('proxyquire');

const databaseStub = require('./stubs/database.stub');
const mega = proxyquire('../lib/module', { './database': databaseStub });

test('module.doSomething', t => {
    mega.doSomething({cmd: 'test', bla: 'test'}, (err, data) => {
        if(err) {
            return t.fail();
        }
        t.pass();
    });
});

test('module.doSomething2', t => {
    mega.doSomething({message: 'fail', bla: 'test'}, (err, data) => {

        if(err) {
            return t.pass(err.message);
        }
        return t.fail('should return error');
    });
});
