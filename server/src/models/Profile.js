var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {PlaylistSchema} = require('./Playlist')

var profileSchema = new Schema({
    name: String,
    email: String,
    playlists: [{type:Schema.Types.ObjectId, ref:'playlists'}]
});

module.exports = {
    Profile: mongoose.model('profiles', profileSchema),
    ProfileSchema: profileSchema
}