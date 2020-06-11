var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var uploadSchema = new Schema({
    name: String,
    path: String,
    size: Number,
    currentSize: Number
});

module.exports = {
    Upload: mongoose.model('uploads', uploadSchema),
    UploadSchema: uploadSchema
}