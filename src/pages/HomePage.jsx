import { useState, useEffect, useCallback } from 'react'
import { searchBooks, getRecommendations } from '../api/booksApi'
import BookCard from '../components/books/BookCard'
// import Breadcrumbs from '../components/ui/Breadcrumbs'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { FiSearch, FiBookOpen, FiTrendingUp, FiStar, FiBookmark } from 'react-icons/fi'

const HomePage = () => {
  const [books, setBooks] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  // Función para normalizar libros y asegurar imágenes
  const normalizeBooksWithImages = useCallback((booksArray) => {
    if (!booksArray || !Array.isArray(booksArray)) return []
    
    return booksArray.map(book => {
      // Si ya tiene volumeInfo, asegurar que la imagen existe
      if (book.volumeInfo) {
        // Si no tiene imagen, asignar placeholder
        if (!book.volumeInfo.imageLinks?.thumbnail && !book.volumeInfo.imageLinks?.smallThumbnail) {
          return {
            ...book,
            volumeInfo: {
              ...book.volumeInfo,
              imageLinks: {
                thumbnail: `https://placehold.co/200x300/3b82f6/white?text=${encodeURIComponent(book.volumeInfo.title || 'Libro')}`
              }
            }
          }
        }
        return book
      }
      
      // Si es libro de OpenLibrary sin volumeInfo
      const title = book.title || 'Libro'
      const coverId = book.cover_i || book.covers?.[0]
      const thumbnail = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : `https://placehold.co/200x300/3b82f6/white?text=${encodeURIComponent(title)}`
      
      return {
        id: book.key?.replace('/works/', '') || `book-${Date.now()}`,
        volumeInfo: {
          title: title,
          authors: book.author_name || ['Autor desconocido'],
          description: book.description || 'Sin descripción disponible.',
          imageLinks: { thumbnail: thumbnail },
          categories: book.subject || ['General'],
          pageCount: book.number_of_pages_median || 'N/A',
          publishedDate: book.first_publish_year ? `${book.first_publish_year}` : 'Fecha no disponible',
          publisher: book.publisher?.[0] || 'Editorial no disponible',
          language: book.language?.[0] || 'es',
          averageRating: book.ratings_average || 0,
          ratingsCount: book.ratings_count || 0
        },
        saleInfo: { listPrice: { amount: 14.99, currencyCode: 'USD' } }
      }
    })
  }, [])

  const loadInitialBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [recResult, popularResult] = await Promise.all([
        getRecommendations(),
        searchBooks('libros populares', 0, 12)
      ])
      
      // Normalizar los resultados
      const normalizedRecs = normalizeBooksWithImages(recResult.books || recResult)
      const normalizedPopular = normalizeBooksWithImages(popularResult.books || popularResult)
      
      setRecommendations(normalizedRecs)
      setBooks(normalizedPopular)
      
      if (!recResult.success || !popularResult.success) {
        setError('Usando libros de demostración mientras se restablece la conexión')
      }
    } catch (err) {
      console.error('Error loading books:', err)
      setError('Error al cargar libros. Mostrando contenido de demostración.')
      // Cargar libros de demostración
      const demoBooks = getDemoBooks()
      setBooks(demoBooks)
      setRecommendations(demoBooks.slice(0, 6))
    } finally {
      setLoading(false)
    }
  }, [normalizeBooksWithImages])

  // Libros de demostración por si falla todo
  const getDemoBooks = () => {
    const demos = [
      { title: 'El Principito', author: 'Antoine de Saint-Exupéry', cover: 'principito' },
      { title: 'Cien años de soledad', author: 'Gabriel García Márquez', cover: 'cien-anos' },
      { title: '1984', author: 'George Orwell', cover: '1984' },
      { title: 'El Hobbit', author: 'J.R.R. Tolkien', cover: 'hobbit' },
      { title: 'Don Quijote', author: 'Miguel de Cervantes', cover: 'quijote' },
      { title: 'Sapiens', author: 'Yuval Noah Harari', cover: 'sapiens' },
    ]
    
    return demos.map((demo, index) => ({
      id: `demo-${index}`,
      volumeInfo: {
        title: demo.title,
        authors: [demo.author],
        description: `Descripción de ${demo.title}. Esta es una versión de demostración.`,
        imageLinks: { thumbnail: `https://placehold.co/200x300/3b82f6/white?text=${encodeURIComponent(demo.title)}` },
        categories: ['General'],
        pageCount: 200,
        publishedDate: '2020',
        publisher: 'Editorial Demo',
        language: 'es',
        averageRating: 4,
        ratingsCount: 100
      },
      saleInfo: { listPrice: { amount: 14.99, currencyCode: 'USD' } }
    }))
  }

  useEffect(() => {
    loadInitialBooks()
  }, [loadInitialBooks])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setSearching(true)
    setError(null)
    try {
      const result = await searchBooks(searchQuery)
      const normalizedBooks = normalizeBooksWithImages(result.books || result)
      setBooks(normalizedBooks)
      if (!result.success) {
        setError('Mostrando resultados limitados. Verifica tu conexión a internet.')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Error en la búsqueda. Mostrando libros populares.')
      await loadInitialBooks()
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-700 via-orange-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-1.5 mb-4 sm:mb-6">
              <FiBookOpen className="text-orange-300 text-sm sm:text-base" />
              <span className="text-xs sm:text-sm font-medium">Más de 10,000 libros disponibles</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 animate-fade-in">
              Tu Biblioteca Digital
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-orange-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Descubre, lee y disfruta de miles de libros desde cualquier lugar. 
              La lectura nunca fue tan fácil.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-xl mx-auto px-4 sm:px-0">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca por título, autor o género..."
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 pr-12 sm:pr-14 rounded-xl text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm sm:text-base md:text-lg placeholder-gray-400 transition-all duration-300"
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <FiSearch size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />
                </button>
              </div>
            </form>
            
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 px-2">
              {['Ficción', 'Ciencia Ficción', 'Fantasía', 'Romance', 'Historia', 'Biografías'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSearchQuery(cat)
                    handleSearch({ preventDefault: () => {} })
                  }}
                  className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm hover:bg-white/20 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        

        {error && (
          <div className="mb-4 sm:mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-700">{error}</p>
          </div>
        )}

        {/* Resultados de búsqueda */}
        <section className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                {searchQuery ? (
                  <>
                    <FiSearch className="text-orange-500 text-lg sm:text-xl" />
                    <span className="text-base sm:text-lg md:text-xl">Resultados para "{searchQuery}"</span>
                  </>
                ) : (
                  <>
                    <FiTrendingUp className="text-orange-500 text-lg sm:text-xl" />
                    <span className="text-base sm:text-lg md:text-xl">Libros Populares</span>
                  </>
                )}
              </h2>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                {books.length} {books.length === 1 ? 'libro encontrado' : 'libros encontrados'}
              </p>
            </div>
          </div>

          {searching ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm sm:text-base">Buscando libros...</p>
              </div>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {books.map((book, index) => (
                <div key={book.id || `book-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <BookCard book={book} showActions={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
              <FiBookOpen className="text-gray-300 text-4xl sm:text-5xl mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No se encontraron libros</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4">Intenta con otra palabra clave o categoría</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  loadInitialBooks()
                }}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm sm:text-base"
              >
                Ver libros populares →
              </button>
            </div>
          )}
        </section>

        {/* Recomendaciones */}
        {recommendations.length > 0 && !searchQuery && (
          <section className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-1 h-6 sm:h-8 bg-orange-500 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FiStar className="text-yellow-500 text-lg sm:text-xl" />
                <span className="text-base sm:text-lg md:text-xl">Recomendados para ti</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {recommendations.slice(0, 6).map((book, index) => (
                <div key={book.id || `rec-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <BookCard book={book} showActions={false} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="mt-12 sm:mt-16 py-6 sm:py-8 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiBookOpen className="text-orange-600 text-base sm:text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Gran catálogo</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Miles de libros disponibles en múltiples géneros y autores.</p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiBookmark className="text-orange-600 text-base sm:text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Guarda tus favoritos</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Crea tu lista de libros favoritos y accede a ellos fácilmente.</p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiTrendingUp className="text-orange-600 text-base sm:text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Recomendaciones</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Descubre nuevos libros basados en tus intereses.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage