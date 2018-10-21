'use strict';
const mongo = require('mongodb').MongoClient;
let config = require('config');
const Promise = require('bluebird');

var fs = Promise.promisifyAll(require('fs'));


const mongoUrl = config.get("db.karmasoc-business.dbcon");
let database = {};


function connect() {
    console.log('open database', mongoUrl);
    return mongo.connect(mongoUrl)
        .then(db => {
            console.log('database successfully connected');
            database = db;
            return setupDb(db);
        })
        .then(() => {
            console.log('db setup successful');
        })
        .catch(err => {
            console.error('unable to connect to database', err);
        });
}

function saveCategories() {
    // Read the file and send to the callback
    return fs.readFileAsync(__dirname + '/data/category.json', "utf8").then(data => {
        let objectarr = JSON.parse(data);
        var bulk = database.collection('categories').initializeUnorderedBulkOp();
        objectarr.forEach(function(element) {
            bulk.insert(element);
        });
        return bulk.execute();
    }).catch(err => {
        throw err
    });
}

function saveSubCategories(jsonfile, categoryname) {
    return fs.readFileAsync(jsonfile).then(data => {
        let objectarr = JSON.parse(data);
        findCategoryByName(categoryname).then(result => {
            let category_id = result._id;
            var bulk = database.collection('subcategories').initializeUnorderedBulkOp();
            objectarr.forEach(function(element) {
                element.category_id = category_id;
                bulk.insert(element);
            });
            bulk.execute();
        });
    }).catch(err => {
        throw err;
    });
}

function findCategoryByName(name) {
    let collection = database.collection('categories');
    return collection
        .find({ 'name': name })
        .limit(-1)
        .toArray()
        .then(result => result.length ? result[0] : null);
}

function setupDb() {
    console.log('setting up database');
    let categories = database.collection('categories');
    let subcategories = database.collection('subcategories');

    return Promise.all([categories, subcategories]);
}

connect().then(() => {
    setupDb().then(() => {
        saveCategories().then(result => {
            let arr = [saveSubCategories(__dirname + '/data/homeimprovement.json', 'Home Improvement'),
                saveSubCategories(__dirname + '/data/auto.json', 'Auto'),
                saveSubCategories(__dirname + '/data/health.json', 'Health'),
                saveSubCategories(__dirname + '/data/other services.json', 'Other Services')
            ];
            Promise.all(arr).then(result => {
                console.log("success");
                // process.exitCode = 1;

            }).catch(err => {
                //process.exitCode = 1;
                throw err
            });
        }).catch(err => {
            //process.exitCode = 1;
            throw err
        });
    });
});