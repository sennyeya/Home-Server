var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref:"users"},
    content: String,
    created: Date
}, { collection: 'comments' });

module.exports = {
    Comment: mongoose.model('comments', commentSchema),
    CommentSchema: commentSchema
}