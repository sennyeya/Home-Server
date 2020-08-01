const {exec} = require('child_process');
const fs = require("fs")

let mainStorage = "F:\\"

let videoTitle = "1080P_4000K_304244221.mp4";

let input = `${mainStorage}New folder\\${videoTitle}`;

let dir = `${mainStorage}Clips/${videoTitle}`

let saveFile = `${mainStorage}Clips/Keyframes/${videoTitle}.txt`

if(!fs.existsSync(dir)){
    fs.mkdirSync(dir)
}

let curFile = fs.existsSync(saveFile) ? JSON.parse(fs.readFileSync(saveFile)) : null;
console.log(curFile)

let classes = curFile? curFile.classes: [
    "fingering",
    "fingering",
    "cunnilingus",
    "fingering",
    "sex",
    "handjob or blowjob",
    "cowgirl",
    "sex",
    "doggystyle"
];

let keyframes = curFile? curFile.keyframes:[
    {from:"00:00:48", to:"00:01:27"},
    {from:"00:03:08", to:"00:04:18"},
    {from:"00:04:18", to:"00:04:57"},
    {from:"00:05:00", to:"00:05:22"},
    {from:"00:05:33", to:"00:06:02"},
    {from:"00:06:09", to:"00:07:55"},
    {from:"00:08:00", to:"00:09:11"},
    {from:"00:09:15", to:"00:10:08"},
    {from:"00:10:11", to:"00:10:52"}
]

let i = 0;

const clip = (label)=>{
    return new Promise((res, rej)=>{
        exec(`ffmpeg -i "${input}" -ss ${keyframes[label].from} -to ${keyframes[label].to} -c copy "${dir}/${classes[label].split(" ").join("_")}_${label}.mp4" `, (err)=>{
            if(err) return rej(err)
            res()
        })
    })
}

(async ()=>{
    for(let label in classes){
        await clip(label)
    }
    let file = fs.createWriteStream(saveFile)
    file.write(JSON.stringify({classes, keyframes}))
})()

