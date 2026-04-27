import { useState, useCallback } from 'react'
import { searchBooks, getBookById, getBooksByCategory, getRecommendations } from '../api/booksApi'

export const useBooks = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalItems, setTotalItems] = useState(0)

  const search = useCallback(async (query, startIndex = 0, maxResults = 20) => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchBooks(query, startIndex, maxResults)
      if (result.success) {
        setBooks(result.books)
        setTotalItems(result.totalItems)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getBook = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getBookById(id)
      if (result.success) {
        return result.book
      } else {
        setError(result.error)
        return null
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getByCategory = useCallback(async (category, maxResults = 20) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getBooksByCategory(category, maxResults)
      if (result.success) {
        setBooks(result.books)
        setTotalItems(result.totalItems)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const getRecs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getRecommendations()
      if (result.success) {
        return result.books
      } else {
        setError(result.error)
        return []
      }
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { books, loading, error, totalItems, search, getBook, getByCategory, getRecs }
}