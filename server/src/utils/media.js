const fs = require('fs')

const {imageExtensions, videoExtensions} = require('../config');

module.exports = {
    returnMediaItems: (docs) =>{
        return docs.map(e=>{
            let doc = e._doc;
            if(doc.name===doc.path){
                doc.name = doc.name.substring(doc.name.lastIndexOf('/')+1)
            }
            return {
                ...doc, 
                video:videoExtensions.indexOf(doc.format)!==-1
            }
        })
    }
}