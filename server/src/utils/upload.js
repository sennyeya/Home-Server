const {isVideo, isImage} = require('../utils/file')

module.exports = {
    /**
     * Convert the passed in upload metadata to actual Metadata object.
     * @param {String} name Name of file to upload.
     * @param {String} id Upload id for the file, will be converted to metadata in this method
     * @param {Array<String>} tags list of ids for tags that the user wanted to attach to the uploaded media.
     */
    uploadFile: async (name, id, tags)=>{
        if(isImage(name)){
            let matchingData = await Upload.findById(id).exec();
            if(matchingData.length==0){
                let mData = await getImageData(path)
                let newData = new Metadata({name, path, width:mData.size.width, height:mData.size.height, format:path.extname(path), created: Date.now()})
                await newData.save()
            }
        }else if(isVideo(name)){
            let matchingData = await Upload.findById(id).exec();
            if(matchingData.length==0){
                let mData = await getVideoData(path)
                let newData = new Metadata({name, path, width:mData.video.width, height:mData.video.height, format:path.extname(path), duration: mData.video.duration, created:Date.now()})
                await newData.save()
            }
        }
        await md.save();
    }
}