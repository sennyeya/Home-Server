const express = require('express')
const app  = express.Router();

const {Search} = require('../models/Search');
const {Metadata} = require('../models/Metadata');

const {searchMetadata, searchSearch} = require('../utils/search');
const {returnMediaItems} = require('../utils/media');

app.post('/poll', async (req,res)=>{
    if(!req.body.query){
        res.sendStatus(400);
        return;
    }
    let search = await searchSearch(req.body.query).limit(5).exec();
    console.log(`Found ${search.length} search results for the query: "${req.body.query}"`)
    res.json(search.map(e=>{
        return {
            text:e.query, 
            id:e._id
        }
    }));
})

app.post('/', async (req, res)=>{
    if(!req.body.query){
        return res.json({id:null})
    }
    let search = await Search.findOne({query:req.body.query}).exec();
    let searchParams;
    if(search){
        if(!search.searchParams){
            searchParams = generateSearchParams(req.body.query);
            search.searchParams = searchParams;
            await search.save();
        }else{
            searchParams = JSON.parse(search.searchParams);
        }
    }else{
        searchParams = JSON.stringify(generateSearchParams(req.body.query));
        search = new Search({query:req.body.query, searchParams})
        await search.save();
    }

    res.json({
        id:search._id
    });
})

const generateSearchParams = (query) =>{
    let obj = [];
    return obj;
}

const runQuery = async (query) =>{
    return await Metadata.aggregate(query).exec();
}

module.exports = {
    app,
    generateSearchParams,
    runQuery,
};