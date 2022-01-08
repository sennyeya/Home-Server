var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var metadataSchema = new Schema({
    name: String,
    width: Number,
    height: Number,   
    format: String,
    duration: String,
    path: String,
    views: Number,
    likes: Number,
    dislikes: Number,
    created: Date,
    tags: [{type:Schema.Types.ObjectId, ref:'tags'}],
    thumbnail: {type:Schema.Types.ObjectId, ref:'thumbnails'},
    poster: {type:Schema.Types.ObjectId, ref:'thumbnails'},
    comments: [{type: Schema.Types.ObjectId, ref:'comments'}]
}, { collection: 'metadata' });

metadataSchema.index({ name: 'text', path: 'text', format: 'text'});

module.exports = {
    Metadata: mongoose.model('metadata', metadataSchema),
    MetadataSchema: metadataSchema
}