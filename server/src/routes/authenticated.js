const express = require('express')
const app  = express.Router();
const fs = require('fs')
const path = require('path');
const bodyParser = require('body-parser');
const mime = require('mime-types')

const {generateThumbnail, compressImage, generatePoster} = require('../utils/thumbnail');
const {getImageData, getVideoData} = require('../utils/metadata');
const {storage} = require('../config');

const {parseFilters, parseSort} = require('../utils/filter');
const {traverseDocumentTree, isImage, isVideo, ext} = require('../utils/file');
const {getThumbnail, getShift, getPoster, getGallery, retrieveSearch} = require('../services/media')

const {assertDocumentExists} = require('../middleware/models')

const {Metadata} = require('../models/Metadata');
const {Thumbnail} = require('../models/Thumbnail');
const {Upload} = require('../models/Upload')

const searchRouter = require('./search').app;

app.get('/storage/:file', assertDocumentExists(Metadata, "params.file"), async (req, res)=>{
    let file = await Metadata.findById(req.params.file).exec();
    console.log(`Retrieving disk storage for id: ${req.params.file} and path: ${file.path}`)
    res.sendFile(file.path)
})

app.get('/view_increment', assertDocumentExists(Metadata, "query.id"), async (req, res)=>{
    let file = await Metadata.findById(req.query.id).exec();
    file.views = file.views? file.views+1:1;
    await file.save();
    res.status(200).json({message:"Successfully incremented."});
})

app.get('/shift/:file', assertDocumentExists(Metadata, "params.file"), async (req, res)=>{
    res.json(await getShift(req.query.forward, req.query.backward, req.params.file))
})

app.get('/poster/:file', assertDocumentExists(Metadata, "params.file"), async(req, res)=>{
    res.sendFile(await getPoster(req.params.file))
})

app.get('/thumbnails/:file', assertDocumentExists(Metadata, "params.file"), async (req, res)=>{
    res.sendFile(await getThumbnail(req.params.file))
})

app.get('/media_gallery', async (req, res)=>{
    if(req.query.offset === undefined){
        res.sendStatus(400)
        return;
    }
    console.log(`Request for gallery. SearchId: ${req.query.searchId} size: ${req.query.size} offset: ${req.query.offset}`)
    if(req.query.searchId && req.query.searchId!=="null"){
        res.json(await retrieveSearch(req.query.searchId, req.query.size, +req.query.offset))
    }else{
        res.json(await getGallery(req.query.size, +req.query.offset, parseFilters(req.query), parseSort(req.query.sortBy)))
    }
})

app.get('/reset_cache', async (req, res)=>{
    await checkCache(storage)
    res.status(200).json({message:"Running now."})
})

app.get('/start_upload', async (req, res)=>{ 
    if(!req.query.name || !req.query.size){
        res.status(400).json({message:"Missing required parameter"})
        return;
    }
    let upload = new Upload({name:req.query.name, size:req.query.size, currentSize:0});
    await upload.save();
    console.log(`Uploading file: ${req.query.name}`)
    upload.path = path.join(storage,"/uploads/",upload.id+"."+ mime.extension(req.query.format));
    await upload.save();
    res.status(200).json({id:upload.id})
})

const parseBody = (req, res, next) =>{
    const obj = {};
    let newline = Buffer.from(req.body.indexOf("\r")!==-1?"\r\n":"\n");
    try{
    if(req.body){
        let startIndex = 0;
        let boundary = Buffer.from("------WebKitFormBoundary");
        while(startIndex!==-1){
            let oldIndex = startIndex;
            startIndex = req.body.indexOf(boundary, startIndex+1);
            if(req.body.indexOf(newline, startIndex)===-1){
                break;
            }
            let buffer = req.body.slice(oldIndex, startIndex);
            if(buffer.indexOf(Buffer.from("Content-Type: "))!==-1){
                // Parse file blob content.
                let nameField = Buffer.from('name="');
                let nameFieldIndex = buffer.indexOf(nameField)+nameField.length;
                let name = trim(buffer.slice(nameFieldIndex, buffer.indexOf('"', nameFieldIndex)), newline);

                let descIndex = buffer.indexOf(Buffer.from("Content-Type: "));
                let value = trim(buffer.slice(buffer.indexOf(newline, descIndex)+newline.length+2), newline);
                obj[name] = value;
            }else{
                // Parse basic variable.
                let nameField = Buffer.from('name="');
                let name = trim(buffer.slice(buffer.indexOf(nameField)+nameField.length, buffer.lastIndexOf('"')), newline);
                let value = trim(buffer.slice(buffer.indexOf(newline, buffer.indexOf(nameField))+newline.length+2), newline);
                obj[name] = value.toString();
            }
        }
    }
    req.body = obj;
}catch(err){
    console.log(`ERROR: ${err}`);
}
    next();
}

const trim = (buffer, newline) =>{
    while(buffer.indexOf(newline)===0){
        buffer = buffer.slice(1)
    }
    while(buffer.lastIndexOf(newline)!==-1 && buffer.lastIndexOf(newline)===buffer.length-newline.length){
        buffer = buffer.slice(0, buffer.length-newline.length)
    }
    return buffer;
}

app.post('/upload', bodyParser.raw({inflate:false, limit:'50mb', type:'multipart/form-data'}), parseBody, async (req, res)=>{
    if((+req.body.end-(+req.body.start))!==req.body.file.length){
        return res.sendStatus(400)
    }
    
    let upload = await Upload.findById(req.body.id).exec();
    if(!upload){
        return res.sendStatus(404)
    }
    let writeStream = fs.createWriteStream(upload.path, {flags: 'a'});
    writeStream.write(req.body.file, (err)=>{
        if(err) return res.sendStatus(400)
        console.log(`Wrote ${+req.body.end-(+req.body.start)} bytes`)
        res.sendStatus(200)
    })
})  

const parseMultiform = (body) =>{
    console.log(body.toString(), body.toString().length)
    
    console.log(obj)
    return obj;
}

app.get('/finish_upload', async (req, res)=>{
    res.json([])
})

app.get('/list_tags', async (req, res)=>{
    res.json([])
})

app.use('/search', searchRouter)

async function getFiles(cd){
    await traverseDocumentTree(cd, async (fullPath)=>{
        if(isImage(fullPath)){
            let matchingData = await Metadata.find({name:fullPath}).exec();
            if(!matchingData.length){
                let mData = await getImageData(newDir);
                let newData = new Metadata({name:fullPath, path:newDir, width:mData.size.width, height:mData.size.height, format:path.extname(newDir), created: Date.now()})
                await newData.save();
                let filename;
                try{
                    filename = await compressImage(newData.id, newDir, fullPath)
                }catch(err){
                    console.log(err)
                    filename = 'F:/Fake Folder';
                }
                let thumb = new Thumbnail({name:fullPath, path:filename});
                await thumb.save();
                newData.thumbnail = thumb;
                await newData.save()
                console.log("saved "+newDir)
            }else if(matchingData.length>1){
                let maxDate = 0;
                for(let data of matchingData){
                    if(data.created<maxDate){
                        await Metadata.deleteOne({_id:data._id}).exec()
                    }else{
                        maxDate = data.created;
                    }
                }
            }
        }else if(isVideo(name)){
            let matchingData = await Metadata.find({name:fullPath}).exec();
            if(!matchingData.length){
                let mData = await getVideoData(newDir);
                let newData = new Metadata({name:fullPath, path:newDir, width:mData.video.width, height:mData.video.height, format:path.extname(newDir), duration: mData.video.duration, created:Date.now()})
                await newData.save();
                let filename;
                try{
                    filename = await generateThumbnail(newData.id, newDir, fullPath)
                }catch(err){
                    console.log(err)
                    filename = 'F:/Fake Folder';
                }
                let thumb = new Thumbnail({name:fullPath, path:filename});
                await thumb.save();
                newData.thumbnail = thumb;
                await newData.save()
                console.log("saved "+newDir)
            }else if(matchingData.length>1){
                let maxDate = 0;
                for(let data of matchingData){
                    if(data.created<maxDate){
                        await Metadata.deleteOne({_id:data._id}).exec()
                    }else{
                        maxDate = data.created;
                    }
                }
            }
        }
    })
}

async function checkCache(cd){
    await getFiles(cd);
}

module.exports = app