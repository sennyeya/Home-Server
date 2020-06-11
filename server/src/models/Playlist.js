var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {MetadataSchema} = require('./Metadata')

var playlistSchema = new Schema({
    name: String,
    created: Date,
    items: [MetadataSchema]
});

module.exports = {
    Playlist: mongoose.model('playlists', playlistSchema),
    PlaylistSchema: playlistSchema
}