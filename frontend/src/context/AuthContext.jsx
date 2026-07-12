import { createContext, useContext, useState } from 'react'
const AuthCtx = createContext(null)
export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('lg_user')  || 'null'))
  const [token, setToken] = useState(() => localStorage.getItem('lg_token') || '')
  const login = (tok, usr) => {
    setToken(tok); setUser(usr)
    localStorage.setItem('lg_token', tok)
    localStorage.setItem('lg_user', JSON.stringify(usr))
  }
  const logout = () => {
    setToken(''); setUser(null)
    localStorage.removeItem('lg_token'); localStorage.removeItem('lg_user')
  }
  return <AuthCtx.Provider value={{ user, token, login, logout }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)