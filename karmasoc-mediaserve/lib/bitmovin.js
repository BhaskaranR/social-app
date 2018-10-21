var Q = require('q'),
    config = require('config'),
    bitcodin = require('bitcodin')(config.get("bitmovinKey")),
    createInputPromise, createEncodingProfilePromise, createThumbnailPromise;
let fns = {};

fns.encodeData = function(key) {
    var accessKey = config.get("aws.s3.accessKeyId");
    var secretKey = config.get("aws.s3.accessKeySecret");
    var createInputPromise = bitcodin.input.create({
        "type": "s3",
        "accessKey": accessKey,
        "secretKey": secretKey,
        "bucket": "ksoc-videos",
        "region": "us-east-1",
        "objectKey": key
    });

    var encodingProfileConfiguration = {
        "name": "ksoc Encoding Profile",
        "videoStreamConfigs": [{
                "defaultStreamId": 0,
                "bitrate": 4800000,
                "profile": "Main",
                "preset": "premium",
                "height": 1080,
                "width": 1920
            },
            {
                "defaultStreamId": 0,
                "bitrate": 2400000,
                "profile": "Main",
                "preset": "premium",
                "height": 720,
                "width": 1280
            },
            {
                "defaultStreamId": 0,
                "bitrate": 1200000,
                "profile": "Main",
                "preset": "premium",
                "height": 480,
                "width": 854
            }
        ],
        "audioStreamConfigs": [{
            "defaultStreamId": 0,
            "bitrate": 256000
        }]
    };

    createEncodingProfilePromise = bitcodin.encodingProfile.create(encodingProfileConfiguration);

    var jobConfiguration = {
        "inputId": -1,
        "encodingProfileId": -1,
        "manifestTypes": ["mpd", "m3u8"]
    };

    Q.all([createInputPromise])
        .then(
            function(result) {
                console.log('Successfully created input and encoding profile');
                jobConfiguration.inputId = result[0].inputId;
                jobConfiguration.encodingProfileId = 132871; //result[1].encodingProfileId;


                bitcodin.job.create(jobConfiguration)
                    .then(
                        function(newlyCreatedJob) {
                            console.log('Successfully created a new transcoding job');
                            createThumbnailFromJobId(newlyCreatedJob.jobId);
                            /*var createOutputPromise = bitcodin.output.s3.create({
                                "accessKey": accessKey,
                                "secretKey": secretKey,
                                "bucket": "ksoc-videos",
                                "region": "us-east-1",
                                "objectKey": key
                            });
                            createOutputPromise.then(
                                function(result) {},
                                function(err) {
                                    console.log('error while creating the output to s3');
                                }
                            ); */
                        },
                        function() {
                            console.log('Error while creating a new transcoding job');
                        }
                    );
            },
            function(err) {
                console.log('Error while creating input and/or encoding profile' + err);
            }
        );

}

function createThumbnailFromJobId(jobId) {
    if (isNaN(jobId)) {
        console.log('JobId is not a number.');
        return;
    }

    var thumbnailConfiguration = {
        "jobId": jobId,
        "height": 320,
        "position": 50,
        "async": true //synchronous thumbnail creation is deprecated
    };

    createThumbnailPromise = bitcodin.thumbnail.create(thumbnailConfiguration);

    Q.all([createThumbnailPromise])
        .then(
            function(result) {
                console.log('Successfully created a thumbnail', result);
            },
            function(error) {
                console.log('Error while creating thumbnail:', error);
            }
        );
}


module.exports = fns;