'use strict';
const Joi = require('joi');
const Boom = require('boom');
const mongodb = require('mongodb');
const config = require('config');
const util = require('./util');
const Convert = require('gm').subClass({ imageMagick: true });

let routes = [];

// generic rout for getting file
routes.push({
    method: 'GET',
    path: '/file/{fileId}/{name}.{ext}',
    handler: (request, reply) => {
        let db = request.server.plugins['hapi-mongodb'].db;

        util.safeObjectId(request.params.fileId)
            .then(oId => {
                return db.collection('fs.files')
                    .find({ _id: oId })
                    .limit(-1)
                    .next();
            })
            .then(result => {

                if (!result) {
                    return reply(Boom.notFound());
                }

                let bucket = new mongodb.GridFSBucket(db);
                let readstream = bucket.openDownloadStream(result._id);

                if (request.params.ext === 'mp4') {
                    return reply(readstream).type('video/mp4').bytes(result.length);
                }
                if (request.params.ext === '3gp') {
                    return reply(readstream).type('video/3gpp').bytes(result.length);
                }
                if (request.params.ext === 'mov') {
                    return reply(readstream).type('video/quicktime').bytes(result.length);
                }
                reply(readstream);
            })
            .catch(err => {
                if (err.message === 'Invalid id') {
                    return reply(Boom.badRequest(err.message));
                }
                reply(Boom.badImplementation(err));
            });
    },
    config: {
        auth: false,
        validate: {
            params: Joi.object().keys({
                fileId: Joi.string().required(),
                name: Joi.string().required(),
                ext: Joi.string().required()
                    .regex(/^jpg|png|jpeg|JPG|PNG|JPEG|mp4|3gp|mpeg|MP4|MPEG|mov|MOV$/)
            })
        },
        tags: ['api']
    }
});

// upload image
routes.push({
    method: 'POST',
    path: '/stream/image',
    handler: (request, reply) => {

        let regex = /^image\/(?:jpg|png|jpeg)$/;
        genericFileUpload(request, reply, 'image', regex)

    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image to a profile',
        tags: ['api', 'profile', 'new', 'image'],
        validate: {
            payload: {
                file: Joi.any().required().meta({ swaggerType: 'file' })
            }
        },
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 20 // 20MB
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        }
    }
});

// upload image for post
routes.push({
    method: 'POST',
    path: '/image/post',
    handler: (request, reply) => {

        let regex = /^image\/(?:jpg|png|jpeg)$/;

        let db = request.server.plugins['hapi-mongodb'].db;
        let bucket = new mongodb.GridFSBucket(db);

        console.log(request.payload.file.length);


        let file = request.payload.file[1] || request.payload.file;
        if (!file || !file.hapi) {
            return reply(Boom.badRequest('File required!'));
        }

        // test if an image format
        if (!regex.test(file.hapi.headers['content-type'])) {
            return reply(Boom.unsupportedMediaType('Only image format allowed'));
        }

        let fileName = escapeFilename(file.hapi.filename);

        // create Streams
        let xlargeWritestream = bucket.openUploadStream(fileName);
        let xLargeStream = Convert(file).autoOrient().resize('1400').interlace('Line').stream();


        // create other streams
        let uploadStreamArray = [];
        uploadStreamArray.push(bucket.openUploadStream(fileName));
        uploadStreamArray.push(bucket.openUploadStream(fileName));
        uploadStreamArray.push(bucket.openUploadStream(fileName));

        let streamArray = [];
        streamArray.push(Convert(file).autoOrient().resize('700').interlace('Line').stream());
        streamArray.push(Convert(file).autoOrient().resize('600').interlace('Line').stream());
        streamArray.push(Convert(file).autoOrient().resize('400').interlace('Line').stream());

        // stream biggest image in db
        xLargeStream.pipe(xlargeWritestream);

        // successful upload of biggest image
        xlargeWritestream.on('finish', file => {
            delete request.payload.file;
            reply({
                images: {
                    xlarge: xlargeWritestream.id,
                    large: uploadStreamArray[0].id,
                    normal: uploadStreamArray[1].id,
                    small: uploadStreamArray[2].id,
                    name: file.filename
                },
                payload: request.payload
            });
        });

        xlargeWritestream.on('error', err => {
            reply(Boom.badRequest(err));
        });

        let i = 0;
        streamArray.forEach(stream => {

            stream.pipe(uploadStreamArray[i]);

            uploadStreamArray[i].on('error', err => {
                console.log('ERROR piping file into db: ', err);
            });

            i = i + 1;
        })


    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image for a post',
        tags: ['api', 'post', 'new', 'image'],
        /*      validate: {
                  payload: Joi.object().keys({
                      title: Joi.string().min(3).max(50).required(),
                      long: Joi.number().required(),
                      lat: Joi.number().required(),
                      categories: Joi.array().items(Joi.string().valid('nature', 'culture', 'secret', 'gastro', 'nightlife', 'holiday')).min(1).max(2).required(),
                      file: Joi.any().required().meta({ swaggerType: 'file' })
                  })
              }, */
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            // maxBytes: 1048576 * 6 // 6MB
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        }
    }
});

// upload video
routes.push({
    method: 'POST',
    path: '/stream/video',
    handler: (request, reply) => {

        let regex = /^video\/(?:mp4|3gpp|mpeg|mov|quicktime)$/;
        genericFileUpload(request, reply, 'video', regex);

    },
    config: {
        description: 'Add video',
        notes: 'Uploads a video to db',
        tags: ['api', 'new', 'video'],
        validate: {
            payload: {
                file: Joi.any().required().meta({ swaggerType: 'file' })
            }
        },
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 6 // 6MB
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        }
    }
});

// upload audio
routes.push({
    method: 'POST',
    path: '/stream/audio',
    handler: (request, reply) => {

        let regex = /^audio\/mp3$/;
        genericFileUpload(request, reply, 'audio', regex);

    },
    config: {
        description: 'Add audio',
        notes: 'Uploads an audio file to db',
        tags: ['api', 'new', 'audio'],
        validate: {
            payload: {
                file: Joi.any().required().meta({ swaggerType: 'file' })
            }
        },
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 6 // 6MB
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        }
    }
});

// delete file
routes.push({
    method: 'DELETE',
    path: '/file/{fileId}',
    handler: (request, reply) => {

        let db = request.server.plugins['hapi-mongodb'].db;
        let bucket = new mongodb.GridFSBucket(db);

        util.safeObjectId(request.params.fileId)
            .then(oId => {
                return bucket.delete(oId)
            })
            .then(() => reply('OK'))
            .catch(err => {
                reply(Boom.badImplementation(err));
            });
    },
    config: {
        description: 'Delete file',
        notes: 'Deletes a file with the given ID',
        tags: ['api', 'delete', 'file'],
        validate: {
            params: {
                fileId: Joi.string().required()
            }
        }
    }
});

// upload image for user
routes.push({
    method: 'POST',
    path: '/image/user',
    handler: (request, reply) => {

        let regex = /^image\/(?:jpg|png|jpeg)$/;

        let db = request.server.plugins['hapi-mongodb'].db;
        let bucket = new mongodb.GridFSBucket(db);

        // check on correct file
        let file = request.payload.file[1] || request.payload.file;
        if (!file || !file.hapi) {
            return reply(Boom.badRequest('File required!'));
        }

        // test if an image format
        if (!regex.test(file.hapi.headers['content-type'])) {
            return reply(Boom.unsupportedMediaType('Only image format allowed'));
        }

        let fileName = escapeFilename(file.hapi.filename);

        // create write Streams
        let thumbWriteStream = bucket.openUploadStream(fileName);
        let normalWriteStream = bucket.openUploadStream(fileName);

        // create read Streams
        let thumbReadStream = Convert(file).autoOrient().resize('50').interlace('Line').stream();
        let normalReadStream = Convert(file).autoOrient().resize('200').interlace('Line').stream();

        // stream smallest image in db
        thumbReadStream.pipe(thumbWriteStream);

        // successful upload of smallest image
        thumbWriteStream.on('finish', file => {

            reply({
                name: file.filename,
                images: {
                    small: thumbWriteStream.id,
                    normal: normalWriteStream.id
                }
            });
        });

        thumbWriteStream.on('error', err => {
            reply(Boom.badRequest(err));
        });


        // async stream other image in db
        normalReadStream.pipe(normalWriteStream);

        normalWriteStream.on('error', err => {
            console.log('ERROR piping file into db: ', err);
        });


    },
    config: {
        description: 'Add Image to a user',
        notes: 'Uploads an image to user',
        tags: ['api', 'user', 'new', 'image'],
        validate: {
            payload: {
                file: Joi.any().required().meta({ swaggerType: 'file' })
            }
        },
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 6 // 6MB
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        }
    }
});

module.exports = routes;

function genericFileUpload(request, reply, type, regex) {

    let db = request.server.plugins['hapi-mongodb'].db;

    // check on correct file
    let file = request.payload.file[1] || request.payload.file;
    if (!file || !file.hapi) {
        return reply(Boom.badRequest('File required!'));
    }

    // test if an image format
    if (!regex.test(file.hapi.headers['content-type'])) {
        return reply(Boom.unsupportedMediaType('Only ' + type + ' format allowed'));
    }

    let bucket = new mongodb.GridFSBucket(db);
    let writestream = bucket.openUploadStream(escapeFilename(file.hapi.filename));

    // stream image in db
    file.pipe(writestream);

    // succesful upload of image
    writestream.on('finish', file => {
        reply(file);
    });

    writestream.on('error', err => {
        reply(Boom.badRequest(err));
    });
}

function escapeFilename(filename) {
    let value = filename.toLowerCase();
    return value;
}