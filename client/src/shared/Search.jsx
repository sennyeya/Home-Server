import React from 'react';
import API from '../API';
import './Search.css'
import { useEffect } from 'react';
import { LoadingIndicatorSmall } from './Loading';
import InputWrapper from './InputWrapper';
import searchIcon from '../resources/search.svg'

export default function Search(props) {
    const [search, setSearch] = React.useState("");
    const [related, setRelated] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selected, setSelected] = React.useState(null);
    const [open, setOpen] = React.useState(false)

    const submitSearch = () =>{
        if(search.length<3){
            setRelated([])
            setLoading(false)
            return;
        }
        API.post("search/poll", {query:search, options:props.options}).then(e=>{
            setRelated(e)
            setLoading(false)
        })
    }

    const searchSelected = (e) =>{
        if(e.key !== "Enter"){
            return;
        }
        requestSearch();
    }

    const requestSearch = () =>{
        API.post("search/", {query:search, size:16}).then(e=>{
            props.update(e.id);
            setSelected(null);
        })
    }

    useEffect(()=>{
        window.addEventListener("keydown", searchSelected)
        return () =>{
            window.removeEventListener('keydown', searchSelected)
        }
    }, [])

    useEffect(()=>{
        if(!search){
            setRelated([]);
            return;
        }
        setLoading(true);
        submitSearch();
    }, [search])

    useEffect(()=>{
        if(!selected){
            return;
        }
        setSearch(selected.text);
        requestSearch();
    }, [selected])

    useEffect(()=>{
        setSearch(props.value);
    }, [props.value])

    return (
        <div className="search-bar">
            <div className="search-bar-container">
                <InputWrapper children={
                    <>
                    <input type='text' 
                        onChange={(e)=>{setSearch(e.target.value)}} 
                        onFocus={()=>setOpen(true)}
                        onBlur={(e)=>{
                            setOpen(false)
                        }}
                        defaultValue={props.search} 
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
                    <div className="related-items" tabIndex="0">
                        {console.log(open, related)}
                    {
                        (related && related.length && open) ? 
                        (
                            <>
                            {related.map((e,i)=>{
                                return (
                                    <a key={i} onClick={()=>setSelected(e)}>
                                        <span>{e.text}</span>
                                    </a>
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