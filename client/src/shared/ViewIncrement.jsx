import React, { useEffect } from 'react';
import API from '../API';

export default function ViewIncrement(props) {
    useEffect(()=>{
        API.get("view_increment",{id:props.id})
    }, [])

  return (
      <>
      </>
  )
}