import React from 'react';

export default React.createContext({theme:'dark', toggleTheme:()=>{}});

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
        '& .search-bar, .login-form, .filter-bar, .file-upload-container':{
            backgroundColor:"#121212"
        },
        '& input':{
            backgroundColor:"#cdcdcd"
        },
        '& .input-wrapper':{
            backgroundColor:"#cdcdcd"
        },
        '& .list-items, .file-display-container, .related-items':{
            backgroundColor:"#363636"
        },
        '& footer':{
            backgroundColor:"#242424",
            color:'white'
        },
        '& .file-display-item':{
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
            background: '#efefef',
            borderColor: '#efefef',
            borderWidth: 'thin'
        },
        '& .search-bar':{
            backgroundColor:"#efefef"
        },
        '& .login-form, .search-bar button':{
            backgroundColor:"#dedede"
        },
        '& .input-wrapper':{
            backgroundColor: '#dedede'
        },
        '& input':{
            backgroundColor: '#dedede'
        },
        '& .filter-bar':{
            backgroundColor:"#efefef"
        },
        '& .related-items':{
            backgroundColor:"#cdcdcd"
        },
        '& .list-items':{
            backgroundColor:"#cdcdcd"
        },
        '& footer':{
            backgroundColor:"#242424",
            color:"white"
        }
    }
}

export {ThemeSettings}