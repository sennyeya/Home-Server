import React, { useEffect } from 'react';
import API from '../API';
import { useApiOutlet } from '../contexts/ApiContext';

export default function ViewIncrement(props) {
    const {get} = useApiOutlet()
    useEffect(()=>{
        /*get("view_increment",{id:props.id})*/
    }, [props.id])

  return (
      <>
      </>
  )
}