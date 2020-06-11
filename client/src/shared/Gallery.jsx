import React from 'react';
import Grid from './Grid';

export default function Gallery(props) {
  return (
    <div className="content-div">
        <Grid items={props.items}/>
    </div>
  )
        
}