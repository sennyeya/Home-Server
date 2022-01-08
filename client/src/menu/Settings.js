import React, { useContext } from 'react';
import ThemeContext, { useThemeOutlet } from '../contexts/ThemeContext';
import ToggleSlider from '../shared/ToggleSlider'

/** User settings sub menu, currently just handles light-dark mode. */
export default function Settings(props) {
  const {theme} = useContext(ThemeContext)
  const setTheme = useThemeOutlet()
  return (
    <>
      <ToggleSlider update={setTheme} val1={'light'} val2={'dark'} cond={theme==='dark'}/>
    </>
  )
}