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
const {getThumbnail, getShift, getPoster, getGallery, retrieveSearch, createMedia, getData} = require('../services/media')

const {assertDocumentExists} = require('../middleware/models')

const {Metadata} = require('../models/Metadata');
const {Thumbnail} = require('../models/Thumbnail');
const {Upload} = require('../models/Upload');
const {Comment} = require('../models/Comment');
const {UserHistory} = require('../models/UserHistory')
const {Tag} = require('../models/Tag')

const searchRouter = require('./search').app;
const watchRouter = require('./watch');
const userRouter = require('./user');

const sleep = (ms) =>{
    return new Promise((res, rej)=>{
        setTimeout(res, ms)
    })
}

app.get('/storage/:file', assertDocumentExists(Metadata, "params.file"), async (req, res)=>{
    let file = await Metadata.findById(req.params.file).exec();
    console.log(`Retrieving disk storage for id: ${req.params.file} and path: ${file.path}`)
    res.sendFile(file.path)
})

app.get('/view_increment', assertDocumentExists(Metadata, "query.id"), async (req, res)=>{
    let file = await Metadata.findById(req.query.id).exec();
    file.views = file.views? file.views+1:1;
    await file.save();

    let view = new UserHistory({user: req.user.id, userTime: Number(new Date()), type: "view", metadata:req.query.id});
    await view.save();

    res.status(200).json({message:"Successfully incremented."});
})

app.get('/data/:file', assertDocumentExists(Metadata, "params.file"), async (req, res)=>{
    res.json(await getData(req.params.file))
})

app.get('/poster/:file', assertDocumentExists(Metadata, "params.file"), async(req, res)=>{
    res.sendFile(await getPoster(req.params.file))
})

app.get('/thumbnails/:file', assertDocumentExists(Metadata, "params.file"), async (req, res)=>{
    res.sendFile(await getThumbnail(req.params.file))
})

app.get('/media_gallery', async (req, res)=>{
    if(req.query.offset === undefined){
        req.query.offset = 0;
    }
    if(req.query.offset<0){
        return res.sendStatus(400)
    }
    console.log(`Request for gallery. SearchId: ${req.query.searchId} size: ${req.query.size} offset: ${req.query.offset}`)
    if(req.query.searchId && req.query.searchId!=="null"){
        res.json(await retrieveSearch(req.query.searchId, req.query.size, +req.query.offset, parseFilters(req.query), parseSort(req.query.sortBy)))
    }else{
        res.json(await getGallery(req.query.size, +req.query.offset, parseFilters(req.query), parseSort(req.query.sortBy)))
    }
})

app.get('/reset_cache', async (req, res)=>{
    checkCache(storage)
    res.status(200).json({message:"Running now."})
})

app.get('/start_upload', async (req, res)=>{ 
    if(!req.query.name || !req.query.size){
        return res.status(400).json({message:"Missing required parameter"})
    }
    let upload = new Upload({name:req.query.name, size:req.query.size, currentSize:0});
    await upload.save();
    console.log(`Uploading file: ${req.query.name}`);

    let extension = mime.extension(req.query.format)

    upload.path = path.join(storage,"/uploads/",Number(new Date())+"_"+upload.id+"."+ (extension||"txt"));
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
        if(err) {
            console.log(err)
            return res.sendStatus(500)
        }
        console.log(`Wrote ${+req.body.end-(+req.body.start)} bytes`)
        res.sendStatus(200)
    })
});

app.post('/create_content', async (req, res)=>{
    let upload = await Upload.findById(req.body.id).exec();
    if(!upload){
        return res.sendStatus(400)
    }
    await createMedia(upload.path, req.body.name);
    await Upload.deleteOne({_id:upload.id}).exec();
    res.json({message:"Successfully uploaded!"})
})

app.get('/create_bulk_content', async (req, res)=>{
    for(let item of req.body.items){
        let upload = await Upload.findById(item.id).exec();
        if(!upload){
            return res.sendStatus(400)
        }
        await createMedia(upload.path, item.name);
        await Upload.deleteOne({_id:upload.id}).exec();
    }
    res.json({message:"Successfully uploaded!"})
})

app.get('/list_tags', async (req, res)=>{
    let data = await Tag.find({}).exec();
    res.json(data.map(e=>e.name))
})

app.get('/list_sortby', async (req, res)=>{
    let data = ["Newest", "Oldest", "Most Views", "Highest Ranking"]
    res.json(data)
})

app.post('/comment', assertDocumentExists(Metadata, "body.media"), async (req, res)=>{
    let metadata = await Metadata.findById(req.body.media).exec();
    let comment = new Comment({content:req.body.content, user:req.user._id, created: new Date()})
    await comment.save();
    if(metadata.comments){
        metadata.comments.push(comment._id)
    }else{
        metadata.comments = [comment._id]
    }
    await metadata.save();

    res.json({message:"Saved successfully."})
})

app.get('/comments', assertDocumentExists(Metadata, "query.media"), async (req, res)=>{
    let metadata = await Metadata.findById(req.query.media).exec();
    let comments = await Comment.find({_id:{$in:metadata.comments}}).populate('user').sort({created:-1}).exec();
    res.json(comments.map(e=>{
        let obj = {};
        obj.id = e._id;
        obj.content = e.content;
        obj.user = {username: e.user.username, id:e.user.profile._id};
        obj.created = (new Date(e.created)).toLocaleString()
        return obj;
    }));
})

app.use('/watch', watchRouter)

app.use('/search', searchRouter)

app.use('/user', userRouter)

async function getFiles(cd){
    await traverseDocumentTree(cd, async (fullPath)=>{
        console.log(fullPath)
        if(isImage(fullPath)){
            let matchingData = await Metadata.find({name:fullPath}).exec();
            if(!matchingData.length){
                let mData = await getImageData(fullPath);
                let newData = new Metadata({name:fullPath, path:fullPath, width:mData.size.width, height:mData.size.height, format:path.extname(fullPath), created: Date.now()})
                await newData.save();
                let filename;
                try{
                    filename = await compressImage(newData.id, fullPath, fullPath)
                }catch(err){
                    console.log(err)
                    filename = 'F:/Fake Folder';
                }
                let thumb = new Thumbnail({name:fullPath, path:filename});
                await thumb.save();
                newData.thumbnail = thumb;
                await newData.save()
                console.log("saved "+fullPath)
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
        }else if(isVideo(fullPath)){
            let matchingData = await Metadata.find({name:fullPath}).exec();
            if(!matchingData.length){
                let mData = await getVideoData(fullPath);
                let newData = new Metadata({name:fullPath, path:fullPath, width:mData.video.width, height:mData.video.height, format:path.extname(fullPath), duration: mData.video.duration, created:Date.now()})
                await newData.save();
                let filename;
                try{
                    filename = await generateThumbnail(newData.id, fullPath)
                }catch(err){
                    console.log(err)
                    filename = 'F:/Fake Folder';
                }
                let thumb = new Thumbnail({name:fullPath, path:filename});
                await thumb.save();
                newData.thumbnail = thumb;
                await newData.save()
                console.log("saved "+fullPath)
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