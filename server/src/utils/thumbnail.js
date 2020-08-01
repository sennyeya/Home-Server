
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs');
const pathUtil = require('path')
const gm = require('gm');
const exec = require('child_process').exec

const getVideoInfo = (inputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (error, videoInfo) => {
      if (error) return reject(error);

      const { duration, size } = videoInfo.format;

      resolve({
        size,
        durationInSeconds: Math.floor(duration),
      });
    });
  });
};

const createFragmentPreview = async (
  inputPath,
  outputPath,
  fragmentDurationInSeconds = .5,
  startTimeFraction,
  startTimeFractionIncrement
) => {
return new Promise(async (resolve, reject) => {
  const { durationInSeconds: videoDurationInSeconds } = await getVideoInfo(inputPath,);

  const startTimeInSeconds = getStartTimeInSeconds(
    videoDurationInSeconds,
    fragmentDurationInSeconds,
    startTimeFraction,
    startTimeFraction + startTimeFractionIncrement
  );

  if(fs.existsSync(outputPath)) return resolve();

  return ffmpeg()
    .input(inputPath)
    .inputOptions([`-ss ${startTimeInSeconds}`])
    .outputOptions([`-vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`, `-t ${fragmentDurationInSeconds}`])
    .noAudio()
    .output(outputPath)
    .on('end', resolve)
    .on('error', (e)=>{console.log(e);reject(e)})
    .run();
  });
};

const waitUntilAccessible = (path) =>{
  try{
    fs.unlinkSync(path)
  }catch(err){
    console.log(`Could not unlink path, received error: ${err}`)
    setTimeout(()=>waitUntilAccessible(path), 5000)
  }
}

const removeMP4 = (path) =>{
  for(let file of fs.readdirSync(path)){
      let fileExt = file.split(".");
      fileExt = fileExt[fileExt.length-2]
      if(fileExt!=='thumb'){
        waitUntilAccessible(path+"/"+file)
      }
  }
}

const generateThumbnail = (id,path,numChunks = 10)=>{
  return new Promise(async (res, rej)=>{
    let folder = pathUtil.join(__dirname, "../","\\public\\thumbnails\\videos\\"+id+"\\");

    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder.substring(0,folder.length-1))
    }

    const { durationInSeconds } = await getVideoInfo(path);
    if(durationInSeconds<60){
        numChunks = 6;
    }

    let output = folder + "thumb.mp4";
    if(fs.existsSync(output)){
      console.log(`File ${output} exists, deleting all fragments.`)
      removeMP4(folder.substring(0,folder.length-1))
      res(output);
      return;
    }

    try{
      for(let i =0; i< numChunks-4;i++){
        if(fs.existsSync(folder+i+".mp4")){
          continue;
        }
        await createFragmentPreview(path, folder+i+".mp4", .5, i/numChunks+2/numChunks, 1/numChunks)
      }
      let fragFolder = folder.substring(0, folder.length-1);
      console.log("Merging fragments.")
      await mergeFilesAsync(fs.readdirSync(fragFolder),fragFolder, "thumb.mp4", id);
      console.log(`Successfully merged into ${output}.`)
      removeMP4(folder.substring(0,folder.length-1))
      res(output)
    }catch(err){
        res(output)
    }
  })
}

async function compressImage(id,path){
  return new Promise((res, rej)=>{
    let outputFile = pathUtil.join(__dirname, "../","\\public\\thumbnails\\images\\" + id+".jpeg");
    if(fs.existsSync(outputFile)){
      res(outputFile);
      return;
    }
    gm(path)
      .resize('1920', '1080')
      .gravity('Center')
      .background("black")
      .extent(1920, 1080)
      .write(outputFile, function (err) {
          if (err) rej(err);
          res(outputFile)
      });
  })
}

async function generatePoster(id, path, filename){
  return new Promise(async (res, rej)=>{
    let dirname = pathUtil.join(__dirname, "../","\\public\\thumbnails\\posters\\"+id);
    let sourceDir = pathUtil.join(__dirname, "../","/public/thumbnails/videos/"+id+"/")
    
    let video = sourceDir + "thumb.mp4";
    let poster = dirname + ".jpeg";

    if(!fs.existsSync(sourceDir)||!fs.existsSync(video)){
      await generateThumbnail(id, path, filename);
    }
    if(fs.existsSync(poster)){
        res(poster)
        return;
    }

    await screenShot(video, poster);
    res(poster);
  })
}

const screenShot = async (input, output) =>{
  return new Promise((res, rej)=>{
    exec(`ffmpeg -y -ss 0:00 -i \"${input}\" -vframes 1 -q:v 4 \"${output}\"`, (err, stdout, stderr)=>{
      if(err) rej(err);
      res()
    })
  })
}

const mergeFilesAsync = async (files, folder, filename, id) =>
{
  return new Promise((res, rej) => {
    let path = __dirname + `\\${id}.txt`;
    let tempFile = fs.createWriteStream(path)
    for(let file of files){
      tempFile.write('file \''+folder.replace(/\\/g,"/")+"/"+file+"\'\n")
    }
    tempFile.close();
    exec(`ffmpeg -f concat -safe 0 -i \"${path}\" -c:v copy \"${folder+"\\"+filename}\"`, (err, stdout, stderr)=>{
      if(err) {console.log(err);rej(err)}
      waitUntilAccessible(path)
      res()
    })
  })
}

const getStartTimeInSeconds = (
  videoDuration,
  fragmentDuration,
  startTimeFraction,
  endTimeFraction
) => {
  // by subtracting the fragment duration we can be sure that the resulting
  // start time + fragment duration will be less than the video duration
  const safeVideoDurationInSeconds = videoDuration - fragmentDuration;

  // if the fragment duration is longer than the video duration
  if (safeVideoDurationInSeconds <= 0) {
    return 0;
  }

  return getRandomInt(
      startTimeFraction * safeVideoDurationInSeconds,
      endTimeFraction * safeVideoDurationInSeconds,
  );
};

const getRandomInt = (min, max) => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);

  return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
};


module.exports =  {
  generateThumbnail,
  compressImage,
  generatePoster
}