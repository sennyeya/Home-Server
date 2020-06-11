const path = require('path');
const fs = require('fs')

const {videoExtensions, imageExtensions} = require('../config');

module.exports = {
    traverseDocumentTree: async (dir, visit) =>{
        for(let file of fs.readdirSync(dir)){
            let fullPath = dir + '/'+file
            if(fs.lstatSync(fullPath).isDirectory()){
                await getFiles(fullPath)
            }else{
                await visit(fullPath);
            }
        }
    },
    isImage: (file) =>{
        return imageExtensions.indexOf(path.extname(file))!==-1;
    },
    isVideo: (file) =>{
        return videoExtensions.indexOf(path.extname(file))!==-1;
    },
    ext: (file) =>{
        return path.extname(file);
    }
}