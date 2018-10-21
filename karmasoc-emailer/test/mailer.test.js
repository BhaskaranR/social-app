'use strict';
import test from 'ava';
const proxyquire =  require('proxyquire');

const databaseStub = require('./stubs/database.stub');
const mailer = proxyquire('../lib/mailer', { './database': databaseStub });

test('module.doSomething', t => {
    mailer.doSomething({cmd: 'test', bla: 'test'}, (err, data) => {
        if(err) {
            return t.fail();
        }
        t.pass();
    });
});

test('module.doSomething2', t => {
    mailer.doSomething({message: 'fail', bla: 'test'}, (err, data) => {

        if(err) {
            return t.pass(err.message);
        }
        return t.fail('should return error');
    });
});
