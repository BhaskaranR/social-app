'use strict';

const fns = {};

fns.getAllUsers = (message) => {
    if (message.cmd !== 'test') {
        return Promise.reject({ message: 'cmd was not test', code: 4000 });
    }
    return Promise.resolve({ doc: 'asd', processId: process.pid });
};

fns.findDataNearby = (collection, long, lat) => {
    if (!collection || !long || !lat) {
        return Promise.reject({ message: 'collection, long and lat must be defined', code: 4000 });
    }
    return Promise.resolve([{
        dis: 0.0000018511803197994947,
        obj: {
            _id: 'cb71328e75f25d7d343cb0cbbd9a56db',
            userid: 'ec26fc9e9342d7df21a87ab2477d5cf7',
            preBiz: false,
            create_date: '2015-07-22T10:19:22.293Z',
            images: [Object],
            modified_date: '2015-07-27T07:24:06.381Z',
            tags: [Object],
            title: 'Business Headquarter',
            description: 'BABA BLACK SHEEP :)',
            city: [Object],
            public: true,
            geotag: [Object],
            delete: false
        }
    }]);
};


module.exports = fns;