var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    name: String
});

module.exports = {
    Tag: mongoose.model('tags', tagSchema),
    TagSchema: tagSchema
}