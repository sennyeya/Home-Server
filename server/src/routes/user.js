const app = require('express').Router();

const {User} = require('../models/user');
const {UserHistory} = require('../models/UserHistory');
const {Metadata} = require('../models/Metadata');
const {Playlist} = require('../models/Playlist');
const {Profile} = require('../models/Profile')

const {returnMediaItems} = require('../utils/media');

app.get('/playlists', async (req, res)=>{
    let profile = await Profile.findById(req.user.profile).populate('playlists').exec();
    let data = await Playlist.findOne({_id:{$in:profile.playlists.filter(e=>e)}}).populate('items').exec()
    res.json(profile.playlists.filter(e=>e).map(e=>{return {items: returnMediaItems(data.items), name:e.name, id: e._id}}))
})

app.get('/viewed', async (req, res)=>{
    let data = await UserHistory.find({user: req.user.id}).sort({userTime:-1}).limit(18).exec();
    let dataArr = [];
    for(let elem of data){
        if(!data){
            continue;
        }
        try{
            dataArr.push(await Metadata.findById(elem.metadata).exec());
        }catch(err){
            console.log(`Attempted to pull metadata with ID: ${elem.metadata} but could not. Error: ${err}`)
        }
        dataArr = dataArr.filter(e=>e)
    }
    res.json(returnMediaItems(dataArr))
})

app.post('/create_playlist', async (req, res)=>{
    let metadata = await Metadata.find({_id:{$in: req.body.items}}).exec();
    let user = await User.findById(req.user._id).exec();

    let playlist = new Playlist({name: req.body.name, created: new Date(), items: metadata});
    await playlist.save();

    let profile = await Profile.findById(user.profile).exec();
    profile.playlists.push(playlist);
    await profile.save();

    res.json({message:"Saved successfully"})
});

app.get("/playlist_items", async (req, res)=>{
    let playlist = await Playlist.findById(req.query.id).populate('items').exec();
    let media = returnMediaItems(playlist.items);
    res.json({items:media, length:media.length})
})

module.exports = app;