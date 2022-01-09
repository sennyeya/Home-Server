import React from 'react';
import {MessageContext} from '../contexts/MessagingContext'
import './MessageLogger.css'

export default class MessageLogger extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            messages: []
        }

        this.addErrorMessage = this.addErrorMessage.bind(this);
        this.addSuccessMessage = this.addSuccessMessage.bind(this)
        this.removeMessage = this.removeMessage.bind(this);
        this.deleteMessage = this.deleteMessage.bind(this);
    }

    componentDidUpdate() {
        let value = this.context.message;
        if(value){
            if(value instanceof Error){
                this.addErrorMessage(value.message);
            }else{
                this.addSuccessMessage(value.message)
            }
            this.context.setMessage("")
        }
    }

    addErrorMessage = (text) =>{
        let message = {text, error: true, visible:true}
        this.setState({messages:this.state.messages.concat(message)})
        setTimeout(()=>this.removeMessage(message), 15000)
    }

    addSuccessMessage = (text) =>{
        let message = {text, visible:true}
        this.setState({messages:this.state.messages.concat(message)})
        setTimeout(()=>this.removeMessage(message), 15000)
    }

    removeMessage = (message) =>{
        let {messages} = this.state
        if(messages.indexOf(message)===-1){
            return;
        }
        setTimeout(()=>this.deleteMessage(message), 1500);
    }

    deleteMessage = (message) =>{
        this.setState({messages:this.state.messages.filter(e=>e!==message)})
    }

    render(){
        return (
            <div className="message-box">
                {this.state.messages.map((e, i)=>{
                    return (
                    <div key={i} className={"message "+(e.error?"error-message":"success-message")}><div>{e.text}</div><button onClick={()=>this.deleteMessage(e)}>×</button></div>
                    )
                })}
            </div>
        )
    }
}

MessageLogger.contextType = MessageContext;