var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var thumbnailSchema = new Schema({
    name: String,
    path: String
});

module.exports = {
    Thumbnail: mongoose.model('thumbnails', thumbnailSchema),
    ThumbnailSchema: thumbnailSchema
}