import { supabase } from '../config/supabase'

const withTimeout = async (promise, timeoutMs = 5000) => {
  return await Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs)
    })
  ])
}

// ==================== PERFILES ====================
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await withTimeout(
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      5000
    )
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export const getUserRole = async (userId) => {
  const profile = await getUserProfile(userId)
  return profile?.role || 'user'
}

export const getProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting profiles:', error)
    return []
  }
}

export const updateProfile = async (profileId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data
}

export const updateUserRole = async (profileId, role) => {
  return await updateProfile(profileId, { role })
}

export const updateUserSuspension = async (profileId, suspended) => {
  return await updateProfile(profileId, { status: suspended ? 'inactive' : 'active' })
}

export const deleteProfile = async (profileId) => {
  const { error } = await supabase.from('profiles').delete().eq('id', profileId)
  if (error) throw error
  return true
}

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, status, created_at, avatar_url')
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
}

export const deleteUserById = async (userId) => {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const suspendUser = async (userId, suspend = true) => {
  return await updateProfile(userId, { status: suspend ? 'inactive' : 'active' })
}

// ==================== FAVORITOS ====================
export const addToFavorites = async (userId, book) => {
  try {
    const { error } = await supabase.from('user_favorites').upsert({
      user_id: userId,
      book_id: book.id,
      book_title: book.volumeInfo?.title,
      book_thumbnail: book.volumeInfo?.imageLinks?.thumbnail || null
    }, { onConflict: 'user_id, book_id' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const removeFromFavorites = async (userId, bookId) => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, data: [] }
  }
}

export const isFavorite = async (userId, bookId) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle()
    if (error) throw error
    return { success: true, isFavorite: !!data }
  } catch (error) {
    return { success: false, isFavorite: false }
  }
}

// ==================== CARRITO ====================
export const addToCart = async (userId, book) => {
  try {
    const { error } = await supabase.from('user_cart').upsert({
      user_id: userId,
      book_id: book.id,
      book_title: book.volumeInfo?.title,
      book_thumbnail: book.volumeInfo?.imageLinks?.thumbnail || null,
      book_price: book.saleInfo?.listPrice?.amount || 'N/A'
    }, { onConflict: 'user_id, book_id' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const removeFromCart = async (userId, bookId) => {
  try {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getCart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_cart')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, data: [] }
  }
}

export const clearCart = async (userId) => {
  try {
    const { error } = await supabase.from('user_cart').delete().eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==================== SYSTEM LOGS ====================
export const getSystemLogs = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting system logs:', error)
    return []
  }
}

export const getSystemLogsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('system_logs')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count || 0
  } catch (error) {
    return 0
  }
}

export const touchLastActive = async (userId) => {
  try {
    await supabase.from('profiles').update({ last_active: new Date().toISOString() }).eq('id', userId)
  } catch (error) {
    console.error('Error updating last_active:', error)
  }
}