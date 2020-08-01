const {videoExtensions, imageExtensions, storage} = require('../config')

module.exports = {
    parseFilters: (query) =>{
        var regexp = new RegExp("^"+ storage);
        var obj = {
            $and:[{path:regexp}]
        };
        if(!obj.$and){
            obj = {$and:[]}
        }
        if(query.image==="true"&&query.video==="true"){
            obj.$and.push({$or:[{format:{$in: imageExtensions}}, {format:{$in: videoExtensions}}]})
        }else if(query.image==="true"){
            obj.$and.push({format:{$in: imageExtensions}})
        }else if(query.video==="true"){
            obj.$and.push({format:{$in: videoExtensions}})
        }
        if(+query.from&&+query.to){
            obj.$and.push({created: {$gt: query.from}}, {created: {$lt: query.to}})
        }else if(+query.from){
            obj.$and.push({created:{$gt: query.from}});
        }else if(+query.to){
            obj.$and.push({created:{$lt: query.to}})
        }
        if(query.tags && query.tags!=="undefined"){
            obj.$and.push({tags:{$contains: query.tags}})
        }
        if(obj.$and && obj.$and.length===1){
            let key = Object.keys(obj.$and[0])[0];
            obj[key] = obj.$and[0][key];
            delete obj.$and;
        }
        return obj;
    },
    parseSort: (text) =>{
        let obj = {views:-1};
        if(text==="createdAsc"){
            obj = {created:1}
        }else if(text==="createdDesc"){
            obj = {created:-1}
        }
        return obj;
    }
}