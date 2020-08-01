const path = require('path');
const fs = require('fs')

const {videoExtensions, imageExtensions} = require('../config');

const traverse = async (dir, visit) =>{
    for(let file of fs.readdirSync(dir)){
        let fullPath = dir + '/'+file
        if(fs.lstatSync(fullPath).isDirectory()){
            await traverse(fullPath, visit)
        }else{
            await visit(fullPath);
        }
    }
}

module.exports = {
    traverseDocumentTree:traverse,
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