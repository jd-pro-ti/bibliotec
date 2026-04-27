import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getFavorites, removeFromFavorites } from '../../services/supabaseClient'
import { getBookById } from '../../api/booksApi'
import BookCard from '../../components/books/BookCard'
// import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FaHeart, FaTrash, FaBookOpen, FaArrowLeft } from 'react-icons/fa'
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
    return 'https://placehold.co/200x300/f3f4f6/9ca3af?text=Sin+portada'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        {/* Header con diseño mejorado */}
        <div className="mt-4 sm:mt-6 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <FaHeart className="text-white text-base sm:text-xl" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                  Mis Libros Favoritos
                </h1>
              </div>
              <p className="text-gray-500 text-sm sm:text-base ml-12 sm:ml-14">
                {favoriteBooks.length} {favoriteBooks.length === 1 ? 'libro guardado' : 'libros guardados'} en tu colección
              </p>
            </div>
            
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors text-sm sm:text-base bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
            >
              <FaArrowLeft className="text-sm" />
              Seguir explorando
            </Link>
          </div>
        </div>

        {favoriteBooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 md:p-16 text-center border border-gray-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeart className="text-red-300 text-3xl sm:text-4xl" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">No tienes favoritos aún</h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Explora nuestro catálogo y guarda tus libros favoritos</p>
            <Link 
              to="/" 
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Explorar libros
            </Link>
          </div>
        ) : (
          <>
            {/* Contador y estadísticas */}
            <div className="bg-white rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaBookOpen className="text-amber-500 text-sm sm:text-base" />
                    <span className="text-gray-600 text-sm sm:text-base">
                      Total: <span className="font-semibold text-gray-800">{favoriteBooks.length}</span> libros
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-400 text-sm sm:text-base" />
                    <span className="text-gray-600 text-sm sm:text-base">
                      Último agregado: {favoriteBooks[favoriteBooks.length - 1]?.volumeInfo?.title?.slice(0, 20)}...
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('¿Eliminar todos los favoritos?')) {
                      favoriteBooks.forEach(book => {
                        handleRemoveFavorite(book.id, book.volumeInfo?.title)
                      })
                    }
                  }}
                  className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 transition-colors"
                >
                  <FaTrash className="text-xs" />
                  Limpiar todo
                </button>
              </div>
            </div>

            {/* Grid de libros favoritos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
              {favoriteBooks.map((book, index) => (
                <div 
                  key={book.id} 
                  className="relative group animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BookCard book={book} showActions={true} />
                  
                  {/* Botón de eliminar mejorado */}
                  <button 
                    onClick={() => handleRemoveFavorite(book.id, book.volumeInfo?.title)} 
                    disabled={removing === book.id} 
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:scale-110 z-10"
                  >
                    {removing === book.id ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaTrash className="text-red-500 text-xs sm:text-sm" />
                    )}
                  </button>
                  
                  {/* Badge de posición */}
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con sugerencia */}
            <div className="mt-10 sm:mt-12 p-4 sm:p-5 bg-amber-50 rounded-xl text-center">
              <p className="text-amber-700 text-sm sm:text-base">
                💡 ¿Quieres más recomendaciones? 
                <Link to="/populares" className="font-semibold underline ml-1 hover:text-amber-800">
                  Descubre libros populares
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UserFavoritesPage