var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {MetadataSchema} = require('./Metadata')

var playlistSchema = new Schema({
    name: String,
    created: Date,
    items: [{type:Schema.Types.ObjectId, ref:'metadata'}]
});

module.exports = {
    Playlist: mongoose.model('playlists', playlistSchema),
    PlaylistSchema: playlistSchema
}