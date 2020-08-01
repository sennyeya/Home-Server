import React, {useState, useMemo, useContext} from 'react'

const UserContext = React.createContext()

export default UserContext;

export function UserBoundary({ children }) {
  const [user, setUser] = useState(null)
  const ctx = useMemo(() => ({ user, setUser }), [user])

  return <UserContext.Provider value={ctx}>{children}</UserContext.Provider>
}

export function useUserOutlet() {
    const ctx = useContext(UserContext)
    return ctx.setUser
}