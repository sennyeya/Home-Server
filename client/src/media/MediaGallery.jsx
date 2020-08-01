import React, {useEffect, useCallback, useMemo} from 'react';
import Gallery from '../shared/Gallery';
import {NumberedPages} from '../shared/Buttons';
import API from '../API';
import Loading from '../shared/Loading';
import HistoryTracking from '../shared/HistoryTracking';
import Search from '../shared/Search';
import Filter from '../shared/Filter';
import PageCounter from '../shared/PageCounter'
import { getParamFromURL } from '../shared/Utils';

/**
 * Render a set of media items. Parameters passed in by url.
 */
export default function MediaGallery(props) {
    const [offset, setOffset] = React.useState(getParamFromURL("offset")||0);
    const [loading, setLoading] = React.useState(false);
    const [media, setMedia] = React.useState([]);
    const [length, setLength] = React.useState(0);
    const [size] = React.useState(16)
    const [searchOptions, setSearchOptions] = React.useState({});
    const [filterOptions, setFilterOptions] = React.useState({});
    const [search, setSearch]  = React.useState("");

    const [searchLoading, setSearchLoading] = React.useState(false)
    const [filterLoading, setFilterLoading] = React.useState(false)

    const loadNext = useCallback(()=>{
        // Get items from API.
        let obj = {...searchOptions, ...filterOptions, offset};
        let onlyFilledValues = {};
        for(let elem of Object.keys(obj)){
            if(obj[elem] || obj[elem]===0){
                onlyFilledValues[elem] = obj[elem]
            }
        }
        API.get('media_gallery', onlyFilledValues).then(e=>{
            setMedia(e.media);
            setLength(e.length);
            setSearch(e.search||"");
            setLoading(false);
        })
    }, [searchOptions, filterOptions, offset])

    /** Update offset and reload content. */
    useEffect(()=>{
        setLoading(true);
    }, [offset])

    /** Update content when loading set to true. */
    useEffect(()=>{
        if(loading){
            loadNext()
        }
    }, [loading])

    /** Update gallery based on search entry. */
    const searchUpdate = useCallback((id) =>{
        setSearchLoading(true)
        setSearchOptions({...searchOptions, searchId:id});
    }, [searchOptions])

    /** Update gallery based on filter options. */
    const filterUpdate = useCallback((newOptions) =>{
        setFilterLoading(true)
        setFilterOptions({...filterOptions, ...newOptions})
    }, [filterOptions])

    const reload = () =>{
        if(searchLoading && filterLoading && !loading){
            setOffset(0);
        }
        setLoading(true);
    }

  return (
    <>
        <HistoryTracking name="offset" value={+offset} trigger={setOffset}/>
        <h1>Search</h1>
        <div className="boxed-content">
            <Search update={searchUpdate} options={filterOptions} value={search} trigger={reload}/>
            <Filter update={filterUpdate} trigger={reload}/>
        </div>
        <div className="boxed-content">
        {
            loading?
            <Loading/>:
            <>
                <PageCounter offset={+offset} size={size} length={length}/>
                <Gallery items={media} size={4}/>
                <NumberedPages size={size} length={length} offset={+offset} update={setOffset}/>
            </>
        }
        </div>
        
    </>
)
}