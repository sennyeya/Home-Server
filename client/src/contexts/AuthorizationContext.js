import React, {useState, useMemo, useContext, useEffect} from 'react'
import { post } from '../API'

export function handleUnauthorized(auth, setAuth){
    console.log(window.location.href)
    if(!auth && !window.location.href.endsWith('/login')){
        window.location.href = '/login'
    }
}

export const AuthorizationContext = React.createContext()

export default function AuthorizationBoundary({ children }) {
    const [auth, setAuth] = useState(JSON.parse(localStorage.getItem('auth')))
    const ctx = useMemo(() => ({ 
        auth, 
        setAuth 
    }), [auth])

    useEffect(()=>{
        localStorage.setItem('auth', JSON.stringify(auth));
    }, [auth])

    useEffect(()=>{
        handleUnauthorized(auth)
    })

    return <AuthorizationContext.Provider value={ctx}>{children}</AuthorizationContext.Provider>
}

export function useAuthOutlet() {
    return useContext(AuthorizationContext)
}