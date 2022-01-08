const gm = require('gm')
const ffmpeg = require('fluent-ffmpeg')

module.exports = {
    getImageData: (filename)=>{
        return new Promise((res, rej)=>{
            gm(filename).identify((err, data)=>{
                if(err) rej(err)
                res(data)
            })
        })
    },
    getVideoData: (filename) =>{
        return new Promise((res, rej)=>{
            ffmpeg.ffprobe(filename, (err, data)=>{
                if(err) rej(err)
                let obj = {};
                for(let stream of data.streams){
                    if(stream.codec_type==="video"){
                        obj.video = stream
                    }else if(stream.codec_type==="audio"){
                        obj.audio = stream
                    }
                }
                res(obj)
            })
        })
    }
}