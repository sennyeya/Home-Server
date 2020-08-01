const parseType = (value)=>{
    if(value==="true"||value==="false"){
        return value==="true"
    }else if(!isNaN(value)){
        return +value
    }else if(value.substring(0, 1)==="["){
        return value.substring(1,value.length-1).split(",").map(e=>parseType(e))
    }
    return value;
}

const getParam = (param) =>{
    let query = window.location.search;
    if(query){
        query = query.substring(1).split("&");
        for(let e of query){
            let split = e.split("=")
            if(split[0]===param){
                let parsed = parseType(split[1]);
                return parsed;
            }
        }
    }
    return null;
}

module.exports = {
    getParamFromURL: getParam
}
