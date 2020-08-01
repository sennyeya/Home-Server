import React, { useEffect, useCallback } from 'react';
import { LoadingIndicator } from './Loading';
import Gallery from './Gallery'
import API from '../API';
import './RecommendedContent.css'

export default function RecommendedContent(props){
    let [loading, setLoading] = React.useState(true);
    let [items, setItems] = React.useState([]);
    let [offset, setOffset] = React.useState(0)

    const updateContent = useCallback(()=>
            API.get('watch/recommended_content', {id:props.id, offset}).then(e=>{
                setItems(items.concat(e));
                setLoading(false)
            }), [items, props.id])

    useEffect(()=>{
        setLoading(true)
        updateContent();
    }, [offset])

    return (
        <div className="recommended-content-container">
            {loading?<LoadingIndicator/>:(
                <Gallery items={items}
                        size={4}/>
            )}
            <button onClick={()=>setOffset(offset+16)}>Load More</button>
        </div>
    )
}