import React, { useContext, useMemo } from 'react';
import API from '../API';
import {Redirect} from 'react-router-dom'
import './Login.css'
import FormElement from '../shared/FormElement';
import InputWrapper from '../shared/InputWrapper.jsx'
import {UserContext, useUserOutlet } from '../contexts/UserContext';
import { ApiContext, useApiOutlet } from '../contexts/ApiContext';
import { useAuthOutlet } from '../contexts/AuthorizationContext';

/**
 * Login page.
 */
export default function Login(props) {
    const {user} = useContext(UserContext)

    const {setAuth} = useAuthOutlet();

    /** User entered username. */
    let [username, setUsername] = React.useState("");

    /** User entered password. */
    let [password, setPassword] = React.useState("");

    /** Error state. */
    let [errors, setErrors] = React.useState("");

    const {post} = useApiOutlet()

    /** Send the user information to the server for validation. */
    const postLogin = useMemo(()=>{
        return async () => {
            try{
                const resp = await post('token/', {username, password})
                setAuth(resp);
                window.location.href="/"
            }catch(err){
                setErrors(err.message)
            }
        }
    }, [post, username, password, setErrors])
  return (
        <div className="login-container">
            <div className="login-input">
                <div className="login-form">
                    {errors?<p style={{color:"red"}}>{errors}</p>:<></>}
                    <FormElement label={<p>Username: </p>} item={<InputWrapper children={
                        <input onChange={(e)=>setUsername(e.target.value)} id="username" name="username" type="text"/>
                        }/> 
                    }/>
                    <FormElement label={<p>Password: </p>} item={<InputWrapper children={
                        <input onChange={(e)=>setPassword(e.target.value)} id="password" name="current-password" type="password"/>}/>
                    }/>
                    <button onClick={postLogin} onTouchEnd={postLogin}>Login</button>
                </div>
                {user?<Redirect to="/"/>:<></>}
            </div>
        </div>
    )
}