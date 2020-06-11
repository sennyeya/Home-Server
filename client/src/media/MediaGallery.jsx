import React, {useEffect} from 'react';
import Gallery from '../shared/Gallery';
import {ButtonNextBack} from '../shared/Buttons';
import API from '../API';
import Loading from '../shared/Loading';
import HistoryTracking from '../shared/HistoryTracking';
import Search from '../shared/Search';
import Filter from '../shared/Filter'

export default function MediaGallery(props) {
    const [offset, setOffset] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [media, setMedia] = React.useState([]);
    const [length, setLength] = React.useState(0);
    const [size] = React.useState(24)
    const [searchId, setSearchId] = React.useState(null);
    const [options, setOptions] = React.useState({});

    const [search, setSearch]  = React.useState("");
    const ref = React.createRef();
    const searchRef = React.createRef();

    const loadNext = ()=>{
        let obj = options;

        if(window.location.search.indexOf("?")!==-1){
            var search = window.location.search.substring(1);
            search = search.split("&").reduce((old, e)=>{
                let split = e.split("=");
                old[split[0]] = split[1];
                return old;
            }, {});
            obj = search;
        }

        obj.offset = offset;
        if(searchId){
            obj.searchId = searchId;
        }

        return new Promise((res, rej)=>{
            API.get('media_gallery', obj).then(e=>{
                setMedia(e.media)
                setLength(e.length);
                setSearch(e.search||"")
                res();
            })
        })
    }

    useEffect(()=>{
        if(window.location.search.indexOf("?")!==-1){
            var search = window.location.search.substring(1);
            search = search.split("&").reduce((old, e)=>{
                let split = e.split("=");
                old[split[0]] = split[1];
                return old;
            }, {})
            setOptions(search);
        }else{
            setOptions({})
        }
    }, [])

    useEffect(()=>{
        setLoading(true);
        loadNext().then(()=>setLoading(false))
    }, [offset])

    useEffect(()=>{
        if(!loading){
            return;
        }
        loadNext().then(()=>setLoading(false));
    }, [loading])

    const searchUpdate = (id) =>{
        setSearchId(id);
        setLoading(true);
    }

    const filterUpdate = (options) =>{
        setOptions(options)
        setLoading(true);
    }

  return (
    <div className="content">
        <HistoryTracking name="offset" value={offset} ref={ref} trigger={setOffset}/>
        {console.log(options)}
        <HistoryTracking name="searchId" value={searchId} ref={searchRef} trigger={setSearchId}/>
        <Search update={searchUpdate} options={options} value={search}/>
        <Filter update={filterUpdate}/>
        {
            loading?
            <Loading/>:
            <>
                <Gallery items={media}/>
                <ButtonNextBack size={size} length={length} offset={offset} update={setOffset}/>
            </>
        }
        
    </div>
)
}