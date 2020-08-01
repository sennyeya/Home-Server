const fs = require('fs')

const {Metadata} = require('../models/Metadata');
const {Thumbnail} = require('../models/Thumbnail');
const {Search} = require('../models/Search');

const {trimFat} = require('../utils/models');
const {isVideo, isImage, ext} = require('../utils/file');
const {generateThumbnail, compressImage, generatePoster} = require('../utils/thumbnail');
const {getImageData, getVideoData} = require('../utils/metadata');
const {returnMediaItems} = require('../utils/media');
const {runSearch} = require('../utils/search');

const {imageExtensions} = require('../config');
const {UnknownFormatException} = require('../errors/media');

var inProgress = {};

function sleep(seconds){
    return new Promise(res => setTimeout(() => res(), seconds*1000));
}

async function getPoster(id){
    let file = await Metadata.findById(id).populate('poster').exec();
    let poster = file.poster? file.poster.path: "";
    if(!file.poster||!fs.existsSync(file.poster.path)){
        console.log(`Poster with id: "${id}" does not exist, creating.`)
        let filename;
        if(isVideo(file.path)){
            while(inProgress[id]){
                await sleep(10);
                console.log(`A poster job for ID: ${id} is in progress, waiting until it finishes.`)
            }
            inProgress[id] = true;
            await generateThumbnail(id, file.path)
            filename = await generatePoster(id, file.path, file.name);
            delete inProgress[id];
            console.log(`A poster job for ID: ${id} has finished.`)
        }else{
            throw new UnknownFormatException();
        }
        poster = (await createPoster(file.id, filename)).path;
    }
    return poster;
}

async function getThumbnail(id){
    let file = await Metadata.findById(id).populate('thumbnail').exec();
    let thumb = file.thumbnail? file.thumbnail.path: "";
    if(!file.thumbnail||!fs.existsSync(file.thumbnail.path)){
        console.log(`Thumbnail with id: "${id}" does not exist, creating.`)
        let filename;
        if(isImage(file.path)){
            filename = await compressImage(id, file.path)
        }else if(isVideo(file.path)){
            while(inProgress[id]){
                await sleep(10);
                console.log(`A video thumbnail job for ID: ${id} is in progress, waiting until it finishes.`)
            }
            inProgress[id] = true;
            filename = await generateThumbnail(id, file.path);
            delete inProgress[id];
            console.log(`A video thumbnail job for ID: ${id} has finished.`)
        }else{
            throw new UnknownFormatException();
        }
        thumb = (await createThumbnail(file.id, filename)).path;
    }
    return thumb;
}

async function retrieveSearch(id, size=24, offset, filters, sortBy){
    let media = await runSearch(id, size, offset, filters, sortBy);
    let search = await Search.findById(id).exec();
    console.log(`Found ${offset+media.items.length} items / ${media.length} with size of ${size} for query ${search.query}`)
    return {length:media.length, media:returnMediaItems(media.items), offset:size+offset, search:search.query};
}

async function getGallery(size = 16, offset, filters, sortBy){
    const media = await Metadata.find(filters).sort(sortBy).skip(offset).limit(size).exec();
    let length = await Metadata.countDocuments(filters).exec();
    console.log(`Found ${media.length+offset} / ${length} (${media.length} from this query) items for filter: ${JSON.stringify(filters)}`)
    return {
        media:returnMediaItems(media), 
        length, 
        offset:offset+size
    }
}

async function getShift(forward, backward, file){
    let sortDir = 0;
    let skipAmt = 0;
    let findBy = {};
    if(forward){
        sortDir = 1;
        skipAmt = +forward-1;
        findBy = {$gt: file};
    }else if(backward){
        sortDir = -1;
        skipAmt =+backward-1;
        findBy = {$lt: file};
    }
    let media;
    if(forward||backward){
        media = await Metadata.findOne({_id: findBy}).sort({_id: sortDir}).skip(skipAmt).limit(1).exec();
    }else{
        media = await Metadata.findById(file).exec();
    }
    let offset = await Metadata.find({_id: {$lt:media._id}}).count().exec();
    let length = await Metadata.countDocuments({format: {$in:imageExtensions}}).exec();
    return {
        path:media.id, 
        video:isVideo(media.path), 
        length, 
        data:trimFat(media), 
        offset
    }
}

async function getData(file){
    let media = await Metadata.findById(file).exec();
    let offset = await Metadata.find({_id: {$lt:media._id}}).count().exec();
    let length = await Metadata.countDocuments({format: {$in:imageExtensions}}).exec();
    return {
        path:media.id, 
        video:isVideo(media.path), 
        length, 
        data:trimFat(media), 
        offset
    }
}

async function createThumbnail(id, path){
    let metadata = await Metadata.findById(id).populate('thumbnail').exec()
    let thumb;
    if(!metadata.thumbnail){
        thumb = new Thumbnail({name:metadata.name, path:path});
    }else{
        thumb = await Thumbnail.findById(metadata.thumbnail).exec();
        if(!thumb){
            thumb = new Thumbnail(
                    { name: metadata.name, path:path }
                )
        }
        thumb.name = metadata.name;
        thumb.path = path;
    }
    thumb = await thumb.save();
    metadata.thumbnail = thumb._id;
    await metadata.save();
    return thumb;
}

async function createPoster(id, path){
    let metadata = await Metadata.findById(id).populate('poster').exec()
    let thumb;
    if(!metadata.poster){
        thumb = new Thumbnail({name:metadata.name, path});
    }else{
        thumb = await Thumbnail.findById(metadata.poster).exec();
        if(!thumb){
            thumb = new Thumbnail(
                    { name: metadata.name, path }
                )
        }
        thumb.name = metadata.name;
        thumb.path = path;
    }
    thumb = await thumb.save();
    metadata.poster = thumb._id;
    await metadata.save();
    return thumb;
}

async function createMedia(path, name){
    if(isImage(path)){
        let mData = await getImageData(path);
        let newData = new Metadata({name, path, width:mData.size.width, height:mData.size.height, format:ext(path), created: Date.now()})
        await newData.save();
        let filename = await compressImage(newData.id, path, path)
        let thumb = new Thumbnail({name:path, path:filename});
        await thumb.save();
        newData.thumbnail = thumb;
        await newData.save();
        console.log(`Saved "${name}" to "${path}"`)
    }else if(isVideo(path)){
        let mData = await getVideoData(path);
        let newData = new Metadata({name, path, width:mData.video.width, height:mData.video.height, format:ext(path), duration: mData.video.duration, created:Date.now()})
        await newData.save();
        let filename = await generateThumbnail(newData.id, path, path)
        let thumb = new Thumbnail({name:path, path:filename});
        await thumb.save();
        newData.thumbnail = thumb;
        await newData.save()
        console.log(`Saved "${name}" to "${path}"`)
    }
}

module.exports = {
    getPoster, getThumbnail, getGallery, getShift, retrieveSearch, createMedia, getData
}