import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { getUserProfile, touchLastActive } from '../services/supabaseClient'

// ✅ Exportación NAMED del Context
export const AuthContext = createContext(null)

// ✅ Hook personalizado para usar el contexto
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

// ✅ Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [userStatus, setUserStatus] = useState('active')
  const [userProfile, setUserProfile] = useState(null)

  const loadUserProfile = useCallback(async (userId) => {
    try {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
      setUserRole(profile?.role || 'user')
      setUserStatus(profile?.status || 'active')
      return profile
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
      setUserRole('user')
      setUserStatus('active')
      return null
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id)
          touchLastActive(currentSession.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (nextSession?.user) {
        await loadUserProfile(nextSession.user.id)
        touchLastActive(nextSession.user.id)
      } else {
        setUserProfile(null)
        setUserRole(null)
        setUserStatus('active')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadUserProfile])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      const profile = data.user?.id ? await loadUserProfile(data.user.id) : null
      
      if (profile?.status && profile.status !== 'active') {
        await supabase.auth.signOut()
        return { success: false, error: 'Tu cuenta está inactiva. Contacta al administrador.' }
      }
      
      if (data.user?.id) touchLastActive(data.user.id)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData }
      })
      if (error) throw error

      if (data.user) {
        await supabase.from('profiles').upsert([{
          id: data.user.id,
          email: data.user.email,
          role: 'user',
          full_name: userData.full_name || '',
          status: 'active'
        }], { onConflict: 'id' })
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setUserProfile(null)
      setUserRole(null)
      setUserStatus('active')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const hasRole = (requiredRole) => {
    if (userStatus !== 'active') return false
    if (!userRole) return requiredRole !== 'admin' && requiredRole !== 'superadmin'
    if (requiredRole === 'superadmin') return userRole === 'superadmin'
    if (requiredRole === 'admin') return userRole === 'admin' || userRole === 'superadmin'
    if (requiredRole === 'user') return ['user', 'admin', 'superadmin'].includes(userRole)
    return true
  }

  const isAdmin = () => userRole === 'admin' || userRole === 'superadmin'
  const isSuperAdmin = () => userRole === 'superadmin'

  const value = {
    user,
    session,
    loading,
    userRole,
    userStatus,
    userProfile,
    login,
    loginWithGoogle,
    register,
    logout,
    hasRole,
    isAdmin,
    isSuperAdmin,
    reloadProfile: async () => user?.id ? await loadUserProfile(user.id) : null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}