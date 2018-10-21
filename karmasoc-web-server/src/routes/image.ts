const imageRoutes = [];
const config = require('config');
const imageFilterValidation = require('../validations/imageFilterValidation');
const imagehandler = require('../controllers/imagesController');

imageRoutes.push({
    method: 'POST',
    path: '/edit/photo',
    handler: imagehandler.filterImage,
    config: {
        description: 'Filter Image',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'post', 'favor', 'favorites'],
        validate: {
            payload: imageFilterValidation.filterImage
        },
        auth: 'jwt'
    }
});


module.exports.routes = imageRoutes;
