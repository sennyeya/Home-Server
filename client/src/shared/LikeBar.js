import React from 'react';
import './LikeBar.css'

let styles = {
    test: 10
};

export default function LikeBar(props) { // Add bar chart eventually
  return (
      <>
        <div className="like-bar" style={styles}></div> 
            <span style={{fontWeight:"600"}}>{((props.likes||0)/(props.dislikes||1)).toFixed(2)}</span>
        </>
  )
}