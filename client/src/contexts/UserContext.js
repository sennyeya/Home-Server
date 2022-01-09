import React, {useState, useMemo, useContext, useEffect} from 'react'
import { LoadingIndicator } from '../shared/Loading';
import { useApiOutlet } from './ApiContext';
import { useAuthOutlet } from './AuthorizationContext';

export const UserContext = React.createContext()

export default function UserBoundary({ children }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const {auth} = useAuthOutlet();
  const {get} = useApiOutlet()
  useEffect(()=>{
    (async ()=>{
      if(auth){
        setUser(await get('users/current'))
        setLoading(false)
      }
    })()
  }, [auth])
  const ctx = useMemo(() => ({ user, setUser }), [user])

  return <UserContext.Provider value={ctx}>{loading ? <LoadingIndicator/> : children}</UserContext.Provider>
}

export function useUserOutlet() {
  return useContext(UserContext)
}