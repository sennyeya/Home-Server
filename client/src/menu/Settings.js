import React from 'react';
import MiniProfile from './MiniProfile'
import ThemeContext from '../contexts/ThemeContext';
import ToggleSlider from '../shared/ToggleSlider'

export default function Settings(props) {
  return (
        <ThemeContext.Consumer>
          {({theme})=>
            <>
              <ToggleSlider update={props.toggle} val1={'light mode'} val2={'dark mode'} cond={theme==='dark'}/>
              {props.user?<MiniProfile user={props.user}/>:<></>}
            </>
          }
        </ThemeContext.Consumer>
  )
}