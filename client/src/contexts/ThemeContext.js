import React, { useState, useMemo, useContext, useEffect } from 'react';

const ThemeContext =  React.createContext();

export default ThemeContext;


/**
 * Basic dark mode/ light mode switch CSS.
 */
let ThemeSettings = {
    'dark': {
        backgroundColor:'black',
        color:'#cccccc',
        '& .content-item a':{
            color:"#cccccc"
        },
        '& button':{
            color:'white',
            background:'#242424',
            borderColor: 'black',
            borderWidth: 'thin'
        },
        '& .search-bar, .login-form, .filter-bar, .file-upload-container, .tab-content, .boxed-content':{
            backgroundColor:"#121212"
        },
        '& input, .input-wrapper, textarea':{
            backgroundColor:"#454545",
            color: "white"
        },
        '& .list-items, .file-display-container, .related-items, .tab':{
            backgroundColor:"#363636"
        },
        '& .tab.selected, .file-display-item':{
            backgroundColor:"#242424",
            color:'white'
        },
        '& .color-glyph':{
            filter: "invert(100%) sepia(100%) saturate(0%) hue-rotate(153deg) brightness(107%) contrast(106%)"
        }
    },
    'light': {
        backgroundColor: 'white',
        color:'black',
        '& .content-item a':{
            color:"black"
        },
        '& button':{
            color: 'black',
            background: '#cecece',
            borderColor: '#efefef',
            borderWidth: 'thin'
        },
        '& .search-bar, .filter-bar, .file-upload-container, textarea':{
            backgroundColor:"#efefef"
        },
        '& .login-form, .search-bar button, .tab-content, .boxed-content, .file-display-container, input, .input-wrapper':{
            backgroundColor:"#dedede"
        },
        '& .filter-bar, .tab':{
            backgroundColor:"#efefef"
        },
        '& .related-items, .tab.selected, .list-items, .file-display-item':{
            backgroundColor:"#cdcdcd"
        },
        '& .color-glyph':{
            filter: "none"
        }
    }
}

export {ThemeSettings}

export function ThemeBoundary({children}){
    const [theme, setTheme] = useState(localStorage.getItem('darkMode') || 'dark')
    const ctx = useMemo(()=>({theme, setTheme}), [theme]);

    useEffect(()=>{
        for(let val of Object.keys(ThemeSettings[theme])){
            document.body.style[val] = ThemeSettings[theme][val];
        }
        document.body.style["padding"] = "5vh 0 0 0"
        localStorage.setItem("darkMode", theme)
    }, [theme])

    return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>
}

export function useThemeOutlet() {
    const ctx = useContext(ThemeContext)
    return (theme)=>{
        if(theme==='dark'){
            ctx.setTheme('light')
        }else{
            ctx.setTheme('dark')
        }
    }
}
