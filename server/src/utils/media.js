const {imageExtensions, videoExtensions} = require('../config');
const {UnknownFormatException} = require('../errors/media');
const {generatePoster} = require('../utils/thumbnail')

module.exports = {
    returnMediaItems: (docs) =>{
        return docs.map(e=>{
            return {
                ...e._doc, 
                video:videoExtensions.indexOf(e._doc.format)!==-1
            }
        })
    }
}