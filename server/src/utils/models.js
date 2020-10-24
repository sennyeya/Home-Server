const path = require('path')

module.exports = {
    trimFat: (document)=>{
        let doc = {...document._doc};
        if(doc.name===doc.path){
            doc.name = path.basename(doc.name)
        }
        return doc;
    }
}