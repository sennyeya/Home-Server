const {Search} = require('../models/Search');
const {Metadata} = require('../models/Metadata');

const searchMetadata = (query) =>{
    return Metadata.find(
        {
            $text:{
                $search:query
            }
        }, {
            score: {$meta: 'textScore'}
        }).sort({
            score: {$meta:'textScore'}
        })
}

const searchSearch = (query) =>{
    return Search.find(
        {
            $text:{
                $search:query
            }
        }, {
            score: {$meta: 'textScore'}
        }).sort({
            score: {$meta:'textScore'}
        })
}

const runSearch = async (id, size, offset = 0, filters, sortBy) =>{
    return new Promise(async (res, rej)=>{
        let search = await Search.findById(id).exec();
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
            return rej("No search found.");
        }
        let data = await searchMetadata(search.query).find(filters).sort(sortBy).limit(size).skip(offset).exec();
        console.log(`Found ${data.length} for the id: "${id}"`)
        let length = await Metadata.countDocuments(
            {
                $text:{
                    $search:search.query
                },
                ...filters
            }
        )
        res({items:data, length})
    })
}

module.exports = {
    searchMetadata,
    searchSearch,
    runSearch
}