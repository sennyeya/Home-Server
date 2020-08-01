var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userHistorySchema = new Schema({
    user: {type:Schema.Types.ObjectId, ref:"users"},
    userTime: Number,
    type: String,
    metadata: {type:Schema.Types.ObjectId, ref:"metadata"}
}, { collection: 'userhistory' });

module.exports = {
    UserHistory: mongoose.model('userhistory', userHistorySchema),
    UserHistorySchema: userHistorySchema
}