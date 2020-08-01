const express = require('express');
const {WatchData} = require('../models/WatchData');
const {Metadata} = require('../models/Metadata');
const { returnMediaItems } = require('../utils/media');

const {assertDocumentExists} = require('../middleware/models')

const app  = express.Router();

app.post('/update', async (req, res)=>{
    if(!req.body.stats){
        return res.sendStatus(400);
    }
    await WatchData.insertMany(req.body.stats.map(
        e=>new WatchData({
            user: req.user.id,
            userTime:e.userTime, 
            state:e.state, 
            watchTimeStamp: e.time,
            videoId: req.body.id
        })))
    res.status(200).json({message:"Success"})
})

app.get('/last_watched', assertDocumentExists(Metadata, "query.id"), async (req, res)=>{
    let data = await WatchData.find({videoId: req.query.id, user: req.user.id}).sort({userTime:-1}).limit(1).exec();
    if(data.length){
        res.json({time:data[0].watchTimeStamp})
    }else{
        res.json({time:0})
    }
})

app.get('/recommended_content', async (req, res)=>{
    let data = await Metadata.find({}).limit(16).exec();
    res.json(returnMediaItems(data));
})

module.exports = app;