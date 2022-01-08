var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {MetadataSchema} = require('./Metadata.model');

var watchDataSchema = new Schema({
    user: {type:Schema.Types.ObjectId, ref:"users"},
    userTime: Number,
    watchTimeStamp: Number,
    state: String,
    videoId: {type:Schema.Types.ObjectId, ref:"metadata"}
}, { collection: 'watchdata' });

module.exports = {
    WatchData: mongoose.model('watchdata', watchDataSchema),
    WatchDataSchema: watchDataSchema
}