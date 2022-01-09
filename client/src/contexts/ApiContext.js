import React, { useMemo, useContext} from 'react'
import {get, post} from '../API'
import { useAuthOutlet, handleUnauthorized } from './AuthorizationContext'
import { useMessageOutlet } from './MessagingContext'
export const ApiContext = React.createContext()

export const authOptions = (auth) => {
    console.log(auth)
    return {
        mode: 'cors',
        headers:{
            'Accept':'application/json',
            'Content-Type':'application/json',
            'Authorization':auth ? `Bearer ${auth.access}` : null
        }
    }
}

export default function ApiBoundary({ children }) {
    const {auth, setAuth} = useAuthOutlet()
    const setMessage = useMessageOutlet()
    const fetchWrapper = useMemo(() => {
        console.log(auth)
        return (fetchFunction) => {
            return async (...fetchArgs) => {
                const resp = await fetchFunction(authOptions(auth), ...fetchArgs)
                console.log(resp)
                if(!resp.ok && resp.status === 401){
                    try{
                        const resp = await post(authOptions(null), 'token/refresh/', {refresh: auth.refresh})
                        const body = await resp.json()
                        setAuth({
                            ...auth,
                            ...body
                        });
                    }catch(err){handleUnauthorized()}
                }else if(!resp.ok){
                    throw new Error({resp:resp.statusText})
                }
                return await resp.json()
            }
        }
    }, [auth])
    const ctx = useMemo(() => ({
        get: fetchWrapper(get),
        post: fetchWrapper(post)
    }), [auth, fetchWrapper])

    return <ApiContext.Provider value={ctx}>{children}</ApiContext.Provider>
}

export function useApiOutlet() {
    return useContext(ApiContext)
}