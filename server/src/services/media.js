const fs = require('fs')

const {Metadata} = require('../models/Metadata');
const {Thumbnail} = require('../models/Thumbnail');
const {Search} = require('../models/Search');

const {trimFat} = require('../utils/models');
const {isVideo, isImage} = require('../utils/file');
const {generateThumbnail, compressImage, generatePoster} = require('../utils/thumbnail');
const {returnMediaItems} = require('../utils/media');
const {runSearch} = require('../utils/search');

const {imageExtensions} = require('../config');
const {UnknownFormatException} = require('../errors/media')

async function getPoster(id){
    let file = await Metadata.findById(id).exec();
    if(!file.poster||!fs.existsSync(file.poster.path)){
        console.log(`Poster with id: "${id}" does not exist, creating.`)
        let filename;
        if(isVideo(file.path)){
            filename = await generatePoster(id, file.path, file.name)
        }else{
            throw new UnknownFormatException();
        }
        await createPoster(file, filename);
    }
    return file.poster.path;
}

async function getThumbnail(id){
    let file = await Metadata.findById(id).exec();
    if(!file.thumbnail||!fs.existsSync(file.thumbnail.path)){
        console.log(`Thumbnail with id: "${id}" does not exist, creating.`)
        let filename;
        if(isImage(file.path)!==-1){
            filename = await compressImage(id, file.path)
        }else if(isVideo(file.path)!==-1){
            filename = await generateThumbnail(id, file.path)
        }else{
            throw new UnknownFormatException();
        }
        await createThumbnail(file, filename);
    }
    return file.thumbnail.path;
}

async function retrieveSearch(id, size=24, offset){
    let media = await runSearch(id, size, offset);
    let search = await Search.findById(id).exec();
    console.log(`Found ${offset+media.items.length} items / ${media.length} with size of ${size}`)
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

async function createThumbnail(metadata, path){
    let thumb;
    if(!metadata.thumbnail){
        thumb = new Thumbnail({name:metadata.name, path:filename});
    }else{
        thumb = await Thumbnail.findById(metadata.thumbnail).exec();
        if(!thumb){
            thumb = new Thumbnail(
                    { name: metadata.name, path:filename }
                )
        }
        thumb.name = metadata.name;
        thumb.path = filename;
    }
    thumb = await thumb.save();
    metadata.thumbnail = thumb;
    await metadata.save();
    return thumb;
}

async function createPoster(metadata, path){
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
    metadata.poster = thumb;
    await metadata.save();
    return thumb;
}

module.exports = {
    getPoster, getThumbnail, getGallery, getShift, retrieveSearch
}