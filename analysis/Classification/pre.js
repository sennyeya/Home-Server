const exec = require('child_process').exec
const fs = require('fs')

const ucf = 'F:/UCF101/UCF-101'

const createClips = (folderPath, videoPath) =>{
    let fileName = videoPath.substring(0, videoPath.length-4)
    let newFolder = folderPath+"/"+fileName;
    if(!fs.existsSync(newFolder)){
        fs.mkdirSync(newFolder)
    }
    return new Promise((res)=>{
        exec(`ffmpeg -i ${folderPath+"/"+videoPath} -vf fps=1 ${newFolder+"/"}%d.png`, (err, stdout, stderr) =>{
            if(err) console.log(stderr)
            res()
        })
    })
}

const generateClips = async (dir) =>{
    for(let folder of fs.readdirSync(dir)){
        for(let file of fs.readdirSync(dir+"/"+folder)){
            if(!file.endsWith(".png")){
                createClips(dir+"/"+folder, file)
            }
        }
    }
}

generateClips(ucf)

const removeIncorrect = (dir) =>{
    for(let folder of fs.readdirSync(dir)){
        for(let file of fs.readdirSync(dir+"/"+folder)){
            if(!file.endsWith(".avi")){
                fs.unlinkSync(dir+"/"+folder+"/"+file)
            }
        }
    }
}

//removeIncorrect(ucf)