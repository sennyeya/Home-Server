import React from 'react';
import {getParamFromURL} from './Utils'

export default class HistoryTracking extends React.PureComponent {

    constructor(props){
        super(props)
        this.state = {
            value: props.value,
            name: props.name
        }
        this.updateHistoryFromPage = this.updateHistoryFromPage.bind(this);
        this.updatePageFromHistory = this.updatePageFromHistory.bind(this);
    }

    parseType = (value)=>{
        if(value==="true"||value==="false"){
            return value==="true"
        }else if(!isNaN(value)){
            return +value
        }else if(value.substring(0, 1)==="["){
            return value.substring(1,value.length-1).split(",").map(e=>this.parseType(e))
        }
        return value;
    }

    updatePageFromHistory = () =>{
        let query = window.location.search;
        let {name, value} = this.state;
        if(query){
            query = query.substring(1).split("&");
            for(let e of query){
                let split = e.split("=")
                if(split[0]===name){
                    let parsed = this.parseType(split[1]);
                    this.setState({value:parsed});
                    this.props.trigger(parsed);
                    return;
                }
            }
        }else{
            this.setState({value:this.parseType(value)})
            this.props.trigger(value);
        }
    }

    updateHistoryFromPage = (val) =>{
        if(this.props.list){
            val = val.value
        }
        let query = window.location.search;
        let {name} = this.state;
        let htmlText = `${name}=${val}`;
        if(query){
            query = query.substring(1).split("&");
            let arr = []
            for(let e of query){
                let split = e.split("=")
                if(split[0]===name){
                    if(val!==""){
                        split[1] = val
                    }
                }
                let param = `${split[0]}=${split[1]}`;
                if(!arr.includes(param)){
                    arr.push(param)
                }
            }
            if(!arr.includes(htmlText)){
                arr.push(htmlText)
            }
            if(window.location.search!=="?"+arr.join("&")){
                if(!this.props.overwrite){
                    window.history.pushState(null, null, "?"+arr.join("&"))
                }else{
                    window.history.replaceState(null, null, "?"+arr.join("&"))
                }
            }
        }else{
            if(window.location.search!==`?${name}=${val}`){
                if(!this.props.overwrite){
                    window.history.pushState(null, null, `?${name}=${val}`)
                }else{
                    window.history.replaceState(null, null, `?${name}=${val}`)
                }
            }
        }
    }

    componentDidMount() {
        this.updatePageFromHistory()
        window.addEventListener("popstate", this.updatePageFromHistory)
        return ()=>{
            window.removeEventListener("popstate",this.updatePageFromHistory)
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.value!==this.props.value){
            this.updateHistoryFromPage(this.props.value)
        }
    }

    render(){
        return (
        <></>
        )
  }
}