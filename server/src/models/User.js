var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {MetadataSchema} = require('./Metadata');
const {ProfileSchema} = require('./Profile')
const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    name: String,
    email: String,
    viewed: [MetadataSchema],
    profile: ProfileSchema
});

userSchema.plugin(passportLocalMongoose);

module.exports = {
    User: mongoose.model('users', userSchema),
    UserSchema: userSchema
}