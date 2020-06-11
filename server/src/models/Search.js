var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var searchSchema = new Schema({
    query: String,
    searchParams: String
});

searchSchema.index({query:"text"})

module.exports = {
    Search: mongoose.model('search', searchSchema),
    SearchSchema: searchSchema
}