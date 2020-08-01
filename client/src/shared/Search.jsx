import React, { useCallback } from 'react';
import API from '../API';
import './Search.css'
import { useEffect } from 'react';
import { LoadingIndicatorSmall } from './Loading';
import InputWrapper from './InputWrapper';
import searchIcon from '../resources/search.svg';
import HistoryTracking from './HistoryTracking'
import { getParamFromURL } from './Utils';

export default function Search({options, update, value, trigger}) {
    const [search, setSearch] = React.useState("");
    const [related, setRelated] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selected, setSelected] = React.useState(null);
    const [searchId, setSearchId] = React.useState(getParamFromURL("searchId")||null);
    const [open, setOpen] = React.useState(false)

    const searchBarClassNames = ["related-item", "search-bar-container"]

    const submitSearch = useCallback(() =>{
        if(search.length<3){
            setRelated([])
            setLoading(false)
        }else{
            API.post("search/poll", {query:search, options}).then(e=>{
                setRelated(e)
                setLoading(false)
            })
        }
    }, [search, options])

    const searchSelected = (e) =>{
        console.log(e)
        if(e.key === "Enter"){
            requestSearch();
        }
    }

    const requestSearch = useCallback(() =>{
        API.post("search/", {query:search, size:16}).then(e=>{
            setSearchId(e.id);
            trigger();
            setSelected(null);
        })
    }, [update, search])

    const closeOnUnrelated = (e)=>{
        if(!e.relatedTarget || searchBarClassNames.indexOf(e.relatedTarget.className)===-1){
            setOpen(false);
        }
    }

    useEffect(()=>{
        update(searchId)
    }, [searchId])

    useEffect(()=>{
        if(search){
            setLoading(true);
            submitSearch();
        }else{
            setRelated([]);
        }
    }, [search])

    useEffect(()=>{
        if(selected){
            setSearch(selected.text);
            requestSearch();
        }
    }, [selected])

    useEffect(()=>{
        setSearch(value);
    }, [value])

    useEffect(()=>{
        window.addEventListener('keydown', searchSelected)
        return ()=> window.removeEventListener('keydown', searchSelected)
    }, [])

    return (
        <div className="search-bar">
            <HistoryTracking name="searchId" value={searchId} trigger={setSearchId}/>
            <div className="search-bar-container">
                <InputWrapper children={
                    <>
                    <input type='text' 
                        onChange={(e)=>{setSearch(e.target.value)}}
                        onFocus={()=>setOpen(true)}
                        onBlur={closeOnUnrelated}
                        value={search} 
                        placeholder='Explore '/>
                    <div style={{display:"flex", flexDirection:"row"}}>
                        {loading?<LoadingIndicatorSmall color="black"/>:<></>}
                        <button onClick={requestSearch} style={{border:"none", backgroundColor:"transparent"}}>
                            <img src={searchIcon} value="Search" alt="Search"/>
                        </button>
                    </div>
                    </>
                }/>
                <div className="related-items-container">
                    <div className="related-items" 
                        tabIndex="0" 
                        onBlur={closeOnUnrelated}>
                    {
                        (related && related.length && open) ? 
                        (
                            <>
                            {related.map((e,i)=>{
                                return (
                                    <button key={i} onClick={()=>setSelected(e)} className={"related-item"}>
                                        <span>{e.text}</span>
                                    </button>
                                )
                            })}
                            </>
                        ): 
                        (<></>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    )
}