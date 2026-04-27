import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getFavorites, removeFromFavorites } from '../../services/supabaseClient'
import { getBookById } from '../../api/booksApi'
import BookCard from '../../components/books/BookCard'
// import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FaHeart, FaTrash } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const UserFavoritesPage = () => {
  const { user } = useAuth()
  const [favoriteBooks, setFavoriteBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  const getThumbnailUrl = (rawBook, favData) => {
    if (rawBook?.cover_i) return `https://covers.openlibrary.org/b/id/${rawBook.cover_i}-M.jpg`
    if (rawBook?.volumeInfo?.imageLinks?.thumbnail) return rawBook.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
    if (favData?.book_thumbnail) return favData.book_thumbnail
    return 'https://placehold.co/200x300/3b82f6/white?text=Libro'
  }

  const normalizeBook = useCallback((rawBook, favData = null) => {
    if (rawBook?.volumeInfo) return rawBook
    return {
      id: rawBook?.id || favData?.book_id || `book-${Date.now()}`,
      volumeInfo: {
        title: rawBook?.title || favData?.book_title || 'Sin título',
        authors: rawBook?.authors || rawBook?.author_name || ['Autor desconocido'],
        description: rawBook?.description || 'No hay descripción disponible.',
        imageLinks: { thumbnail: getThumbnailUrl(rawBook, favData) },
        categories: rawBook?.categories || rawBook?.subject || ['General'],
        pageCount: rawBook?.pageCount || rawBook?.number_of_pages_median || 'N/A',
        publishedDate: rawBook?.publishedDate || rawBook?.first_publish_year || 'Fecha no disponible',
        publisher: rawBook?.publisher || 'Editorial no disponible',
        language: rawBook?.language || 'es',
        averageRating: rawBook?.averageRating || rawBook?.ratings_average || 0,
        ratingsCount: rawBook?.ratingsCount || rawBook?.ratings_count || 0
      },
      saleInfo: { listPrice: { amount: 14.99, currencyCode: 'USD' } }
    }
  }, [])

  const loadFavorites = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await getFavorites(user.id)
      if (result.success && result.data && result.data.length > 0) {
        const booksData = []
        for (const fav of result.data) {
          try {
            const bookResult = await getBookById(fav.book_id)
            booksData.push(bookResult.success && bookResult.book ? normalizeBook(bookResult.book) : normalizeBook(null, fav))
          } catch {
            booksData.push(normalizeBook(null, fav))
          }
        }
        setFavoriteBooks(booksData)
      } else {
        setFavoriteBooks([])
      }
    } catch {
      toast.error('Error al cargar favoritos')
      setFavoriteBooks([])
    } finally {
      setLoading(false)
    }
  }, [user, normalizeBook])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const handleRemoveFavorite = async (bookId, bookTitle) => {
    if (!user) return
    setRemoving(bookId)
    try {
      const result = await removeFromFavorites(user.id, bookId)
      if (result.success) {
        toast.success(`"${bookTitle}" eliminado de favoritos`)
        await loadFavorites()
      } else {
        toast.error('Error al eliminar de favoritos')
      }
    } catch {
      toast.error('Error al eliminar de favoritos')
    } finally {
      setRemoving(null)
    }
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><FaHeart className="text-red-500" /> Mis Libros Favoritos</h1>
            <p className="text-gray-600 mt-1">{favoriteBooks.length} {favoriteBooks.length === 1 ? 'libro guardado' : 'libros guardados'}</p>
          </div>
        </div>

        {favoriteBooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No tienes favoritos aún</h2>
            <p className="text-gray-500 mb-4">Explora nuestro catálogo y agrega tus libros favoritos</p>
            <Link to="/" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">Explorar Libros</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {favoriteBooks.map((book) => (
              <div key={book.id} className="relative group">
                <BookCard book={book} showActions={true} />
                <button onClick={() => handleRemoveFavorite(book.id, book.volumeInfo?.title)} disabled={removing === book.id} className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10">
                  {removing === book.id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <FaTrash className="text-red-500 text-sm" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserFavoritesPage