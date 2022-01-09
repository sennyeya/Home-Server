import React, {useState, useMemo, useContext, useEffect} from 'react'

export const MessageContext = React.createContext()

export default function MessageDisplayBoundary({ children }) {
  const [message, setMessage] = useState(null)
  const ctx = useMemo(() => ({ message, setMessage }), [message])

  return <MessageContext.Provider value={ctx}>{children}</MessageContext.Provider>
}

export function useMessageOutlet() {
    const ctx = useContext(MessageContext)
    return ctx.setMessage
}