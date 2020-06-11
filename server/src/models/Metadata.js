var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {TagSchema} = require('./Tag');
const {ThumbnailSchema} = require('./Thumbnail')

var metadataSchema = new Schema({
    name: {type:String,unique: true},
    width: Number,
    height: Number,   
    format: String,
    duration: String,
    path: String,
    views: Number,
    likes: Number,
    dislikes: Number,
    created: Date,
    tags: [TagSchema],
    thumbnail: ThumbnailSchema,
    poster: ThumbnailSchema
}, { collection: 'metadata' });

metadataSchema.index({ name: 'text', path: 'text', format: 'text'});

module.exports = {
    Metadata: mongoose.model('metadata', metadataSchema),
    MetadataSchema: metadataSchema
}