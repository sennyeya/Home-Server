import React, {useEffect} from 'react';
import API from '../API';
import './List.css';
import {LoadingIndicatorSmall} from './Loading';
import './AsyncMultiselect.css';
import InputWrapper from './InputWrapper'

/**
 * Generic multiselect that gets data dynamically. Only supports single selection, which clears after text entry.
 * @param {Object} props 
 * @param {String} props.url url to get data from, supports GET only.
 * @param {Function} props.update function to pass data back to parent element based on selections.
 */
export default function AsyncMultiselect(props){
    let [options, setOptions] = React.useState([]);
    let [loading, setLoading] = React.useState(true);
    let [query, setQuery] = React.useState("")
    let [filtered, setFiltered] = React.useState([])
    let [open, setOpen] = React.useState(false);
    let [selected, setSelected] = React.useState(-1);

    // Get data.
    useEffect(()=>{
        API.get(props.url).then(e=>{
            setOptions([{value:"message", id:0}]);
            setLoading(false)
        })
    }, [])

    // Filter gotten data with query.
    useEffect(()=>{
        if(!query){
            setFiltered(options)
        }else{
            setFiltered(options.filter(e=> e.value.includes(query) && e.id!==selected).slice(0, 5))
            setSelected(-1)
        }
    }, [query])

    // Set query when someone selects an option. Passes selection back to parent.
    useEffect(()=>{
        if(selected===-1){
            return;
        }
        setQuery(filtered[selected].value)
    }, [selected])

    // Updates the visible lists when options is set.
    useEffect(()=>{
        setFiltered(options.slice(0,5))
        setQuery("");
    }, [options])

    return (
        <div className="select-wrapper">
            <InputWrapper children={
                <>
                    <input type="text" onFocus={()=>setOpen(true)}
                                        onChange={(e)=>setQuery(e.target.value)} 
                                        value={query} 
                                        onBlur={(e)=>{
                                            if(e.relatedTarget && e.relatedTarget.className==="list-items"){
                                                return;
                                            }
                                            setOpen(false);
                                        }}
                                        disabled={loading} />
                    {loading?<LoadingIndicatorSmall color="black"/>:<></>}
                </>}/>
            <div className="list-items-container">
                <div className="list-items" tabIndex="0" style={open?{}:{display: "none"}}>
                    {filtered.map(e=>{
                        return (
                            <a onClick={()=>{setOpen(true);setSelected(e.id)}}>
                                <span>{e.value}</span>
                            </a>
                        )
                    })}
                </div>
            </div>
        </div>
    )  
}