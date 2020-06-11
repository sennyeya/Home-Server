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
                res.sendStatus(400);
                return;
            }
            model.findById(id).exec((err, data)=>{
                if(err){
                    console.log(err);
                    res.sendStatus(404);
                }else{
                    if(!data){
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