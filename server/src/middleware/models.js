const fs = require('fs')

const {Search} = require('../models/Search');
const {Metadata} = require('../models/Metadata');

module.exports = {
    ensureIndexes: async (req, res, next)=>{
        await Search.ensureIndexes();
        await Metadata.ensureIndexes();
        next();
    },
    assertDocumentExists : (model, location) =>{
        return (req, res, next)=>{
            let id = req;
            let objPath = location;
            while(objPath.indexOf(".")!==-1){
                id = id[objPath.substring(0, objPath.indexOf('.'))];
                objPath = objPath.substring(objPath.indexOf('.')+1)
            }
            id = id[objPath];
            if(!id){
                console.log(`No document found for id: ${id}`)
                res.sendStatus(400);
                return;
            }
            model.findById(id).exec((err, data)=>{
                if(err){
                    console.log(`An error occurred while looking up this document: ${err}`);
                    res.sendStatus(404);
                }else{
                    if(!data){
                        console.log(`An error occurred while looking up this document: ${err} for ID: ${id}`);
                        res.sendStatus(404);
                        return;
                    }else{
                        next();
                    }
                }
            })
        }
    }
}