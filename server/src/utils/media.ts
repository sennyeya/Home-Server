const fs = require('fs')

const {videoExtensions} = require('../config');
const { trimFat } = require('./models');

module.exports = {
    returnMediaItems: (docs) =>{
        return docs.map(e=>{
            let doc = trimFat(e);
            return {...doc, video:videoExtensions.indexOf(doc.format)!==-1}
        })
    }
}