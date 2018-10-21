'use strict';
import test from 'ava';
const proxyquire =  require('proxyquire');

const databaseStub = require('./stubs/database.stub');
const newPost = proxyquire('../lib/newPost', { './database': databaseStub });

test('addNewPost-with  data', t => {
    newPost.newTextPost({data: {crap: 'asdfasdfasdf', bla: 'random'}}, (err, data) => {
        t.is(void 0, data);
        t.is('ValidationError', err.name);
    });
});