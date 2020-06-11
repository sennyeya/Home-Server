import React from 'react';
import API from '../API';
import {Redirect} from 'react-router-dom'
import './Login.css'

export default function Login(props) {
    let [username, setUsername] = React.useState("");
    let [password, setPassword] = React.useState("");
    let [errors, setErrors] = React.useState("");

    const postLogin = ()=>{
        API.postRoute('/','/login', {username, password})
            .then(e=>{
                props.setLoggedIn(true);
                window.location.href="/"
            })
            .catch(e=>{
                setErrors(e.message)
            })
    }
  return (
        <div className="login-container">
            <div className="login-input">
                <div className="login-form">
                    {errors?<p>{errors}</p>:<></>}
                    <label htmlFor="username">Username:</label>
                    <input onChange={(e)=>setUsername(e.target.value)} id="username" type="text"></input>
                    <label htmlFor="password">Password:</label>
                    <input onChange={(e)=>setPassword(e.target.value)} id="password" type="password"></input>
                    <button onClick={postLogin}>Login</button>
                </div>
                {props.user?<Redirect to="/"/>:<></>}
            </div>
        </div>
)
}