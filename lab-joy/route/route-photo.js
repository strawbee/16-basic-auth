'use strict';

// route dependencies
const Photo = require('../model/photo');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const bearerAuth = require('../lib/bearer-auth-middleware');

// photo upload dependencies and setup
const multer = require('multer');
const tempDir = `${__dirname}/../temp`;
const upload = multer({ dest: tempDir });

module.exports = function (router) {

    router.get('/photos/me', bearerAuth, (req, res) => {
        Photo.find({ userId: req.user._id })
            .then(photos => photos.map(photo => photo._id))
            .then(ids => res.status(200).json(ids))
            .catch(err => errorHandler(err, res));
    });

    router.post('/photo/:_id?', bearerAuth, bodyParser, upload.single('image'), (req, res) => {
        Photo.upload(req)
            .then(photoData => new Photo(photoData).save())
            .then(pic => res.status(201).json(pic))
            .catch(err => errorHandler(err, res));
    });

    router.get('/photo/:_id?', bearerAuth, (req, res) => {
        if (req.params._id) {
            return Photo.findById(req.params._id)
                .then(pic => res.status(200).json(pic))
                .catch(err => errorHandler(err, res));
        }

        Photo.find({ userID: req.query.userId })
            .then(photos => photos.map(photo => photo._id))
            .then(ids => res.status(200).json(ids))
            .catch(err => errorHandler(err, res));
    });
};