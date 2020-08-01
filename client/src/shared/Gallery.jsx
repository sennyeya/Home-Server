import React from 'react';
import Grid from './Grid';

export default function Gallery(props) {
  return (
    <div className="content-div">
      {
      props.items&& props.items.length 
      ? 
      <Grid items={props.items} 
        size={props.gridSize || 4} 
        select={props.select} 
        update={props.update} 
        selected={props.selected}
        center={props.center}
        playlist={props.playlist}/>
      : 
      <span>No results found.</span>
      }
    </div>
  )
        
}