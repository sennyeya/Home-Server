import React from 'react';

export default class HistoryTracking extends React.PureComponent {

    constructor(props){
        super(props)
        this.state = {
            value: props.value,
            name: props.name,
            manualChange: false
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
                    console.log(`Value: ${split[1]} Type: ${typeof this.parseType(split[1])}`)
                    this.setState({value:this.parseType(split[1]), manualChange: true});
                    this.props.trigger(split[1]);
                    return;
                }
            }
        }else{
            this.setState({value:this.parseType(value), manualChange: true})
            this.props.trigger(value);
        }
    }

    updateHistoryFromPage = (val) =>{
        let query = window.location.search;
        let {name} = this.state;
        let htmlText = `${name}=${val}`;
        if(query){
            query = query.substring(1).split("&");
            let arr = []
            for(let e of query){
                let split = e.split("=")
                if(split[0]===name){
                    split[1] = val
                }
                arr.push(`${split[0]}=${split[1]}`)
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

    componentWillReceiveProps(nextProps) {
        if(nextProps.value!==this.props.value){
            this.updateHistoryFromPage(this.props.value)
        }
    }

    render(){
        return (
        <>{console.log(this.state.value)}</>
        )
  }
}