import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchBooks, getRecommendations } from '../api/booksApi'
import BookCard from '../components/books/BookCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { 
  FiSearch, FiBookOpen, FiTrendingUp, FiStar, FiArrowRight,
  FiChevronLeft, FiChevronRight, FiHome, FiUsers, FiAward 
} from 'react-icons/fi'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'

const HomePage = () => {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const carouselRef = useRef(null)

  const normalizeForCarousel = (rawBooks) => {
    if (!rawBooks || !Array.isArray(rawBooks)) return []
    
    return rawBooks.map(book => {
      const bookId = book.id || book.key?.replace('/works/', '') || `book-${Date.now()}`
      const title = book.volumeInfo?.title || book.title || 'Sin título'
      const author = book.volumeInfo?.authors?.[0] || book.author_name?.[0] || 'Autor desconocido'
      
      let coverUrl = null
      if (book.volumeInfo?.imageLinks?.thumbnail) {
        coverUrl = book.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
      } else if (book.cover_i) {
        coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      } else {
        coverUrl = `https://placehold.co/300x400/f3f4f6/9ca3af?text=${encodeURIComponent(title)}`
      }
      
      return {
        id: bookId,
        title: title,
        author: author,
        cover: coverUrl,
        fallbackCover: `https://placehold.co/300x400/f3f4f6/9ca3af?text=${encodeURIComponent(title)}`
      }
    })
  }

  const normalizeBooksWithImages = useCallback((booksArray) => {
    if (!booksArray || !Array.isArray(booksArray)) return []
    
    return booksArray.map(book => {
      if (book.volumeInfo) {
        if (!book.volumeInfo.imageLinks?.thumbnail) {
          return {
            ...book,
            volumeInfo: {
              ...book.volumeInfo,
              imageLinks: {
                thumbnail: `https://placehold.co/200x300/f3f4f6/9ca3af?text=${encodeURIComponent(book.volumeInfo.title || 'Libro')}`
              }
            }
          }
        }
        return book
      }
      
      const title = book.title || 'Libro'
      const coverId = book.cover_i
      const thumbnail = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : `https://placehold.co/200x300/f3f4f6/9ca3af?text=${encodeURIComponent(title)}`
      
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
      const [recResult, popularResult, featuredResult] = await Promise.all([
        getRecommendations(),
        searchBooks('libros populares', 0, 12),
        searchBooks('best sellers', 0, 8)
      ])
      
      const normalizedRecs = normalizeBooksWithImages(recResult.books || recResult)
      const normalizedPopular = normalizeBooksWithImages(popularResult.books || popularResult)
      const normalizedFeatured = normalizeForCarousel(featuredResult.books || featuredResult)
      
      setRecommendations(normalizedRecs)
      setBooks(normalizedPopular)
      setFeaturedBooks(normalizedFeatured)
    } catch (err) {
      console.error('Error loading books:', err)
      setError('Error al cargar libros')
    } finally {
      setLoading(false)
    }
  }, [normalizeBooksWithImages])

  useEffect(() => {
    loadInitialBooks()
  }, [loadInitialBooks])

  useEffect(() => {
    if (!autoplay || featuredBooks.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredBooks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [autoplay, featuredBooks.length])

  const nextSlide = () => {
    if (featuredBooks.length === 0) return
    setAutoplay(false)
    setCurrentSlide((prev) => (prev + 1) % featuredBooks.length)
    setTimeout(() => setAutoplay(true), 10000)
  }

  const prevSlide = () => {
    if (featuredBooks.length === 0) return
    setAutoplay(false)
    setCurrentSlide((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length)
    setTimeout(() => setAutoplay(true), 10000)
  }

  const handleBookClick = (bookId) => {
    navigate(`/libro/${bookId}`)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setSearching(true)
    setError(null)
    try {
      const result = await searchBooks(searchQuery)
      const normalizedBooks = normalizeBooksWithImages(result.books || result)
      setBooks(normalizedBooks)
    } catch (err) {
      console.error('Search error:', err)
      setError('Error en la búsqueda')
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
      
      {/* Breadcrumbs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-amber-600 transition-colors flex items-center gap-1">
              <FiHome className="text-sm" />
              <span>Inicio</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Biblioteca Digital</span>
            {searchQuery && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-amber-600">"{searchQuery}"</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section con Carrusel */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Columna izquierda */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-100/50 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6">
                <FiBookOpen className="text-amber-600 text-sm" />
                <span className="text-xs font-medium text-amber-700">+10,000 libros disponibles</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Tu Biblioteca 
                <span className="text-amber-600"> Digital</span>
              </h1>
              
              <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
                Descubre, guarda y disfruta de miles de libros desde cualquier lugar. 
                La lectura nunca fue tan fácil y accesible.
              </p>
              
              <form onSubmit={handleSearch} className="max-w-md mx-auto lg:mx-0">
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título, autor o género..."
                    className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-gray-700 placeholder-gray-400 transition-all duration-200"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    <FiSearch size={18} />
                  </button>
                </div>
              </form>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-6">
                {['Ficción', 'Ciencia Ficción', 'Fantasía', 'Romance', 'Historia'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSearchQuery(cat)
                      handleSearch({ preventDefault: () => {} })
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Columna derecha - Carrusel */}
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-stone-100 rounded-full blur-3xl opacity-30"></div>
              
              {featuredBooks.length > 0 ? (
                <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div 
                    ref={carouselRef}
                    className="relative h-[340px] sm:h-[400px] overflow-hidden"
                  >
                    {featuredBooks.map((book, index) => (
                      <div
                        key={book.id}
                        onClick={() => handleBookClick(book.id)}
                        className={`absolute inset-0 transition-all duration-500 ease-out transform cursor-pointer ${
                          index === currentSlide 
                            ? 'opacity-100 translate-x-0' 
                            : index < currentSlide 
                              ? 'opacity-0 -translate-x-full' 
                              : 'opacity-0 translate-x-full'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="relative group">
                            <img 
                              src={book.cover} 
                              alt={book.title}
                              className="h-[280px] sm:h-[340px] w-auto rounded-xl shadow-lg object-cover transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                              onError={(e) => {
                                e.target.src = book.fallbackCover
                              }}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                              <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-lg">
                                Ver detalles
                              </button>
                            </div>
                          </div>
                          <p className="mt-4 text-gray-800 text-center font-medium text-sm line-clamp-1 max-w-[220px]">
                            {book.title}
                          </p>
                          <p className="text-gray-500 text-center text-xs">
                            {book.author}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {featuredBooks.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-600 p-2 rounded-full shadow-md transition-all hover:scale-110"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-600 p-2 rounded-full shadow-md transition-all hover:scale-110"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </>
                  )}
                  
                  {featuredBooks.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      {featuredBooks.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setAutoplay(false)
                            setCurrentSlide(index)
                            setTimeout(() => setAutoplay(true), 5000)
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === currentSlide 
                              ? 'w-6 bg-amber-500' 
                              : 'w-2 bg-gray-300 hover:bg-amber-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                  <FiBookOpen className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-400">Cargando libros...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Géneros - Diseño elegante */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Explorar por género</h2>
              <p className="text-gray-500 text-sm mt-1">Descubre libros según tus intereses</p>
            </div>
            <div className="hidden sm:block w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {[
              'Ficción', 'Ciencia Ficción', 'Fantasía', 'Romance', 
              'Misterio', 'Terror', 'Historia', 'Biografías', 'Poesía'
            ].map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  setSearchQuery(genre)
                  handleSearch({ preventDefault: () => {} })
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 font-medium"
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        {/* Resultados de búsqueda */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {searchQuery ? (
                  <>Resultados para "<span className="text-amber-600">{searchQuery}</span>"</>
                ) : (
                  <>Libros más populares</>
                )}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {books.length} {books.length === 1 ? 'libro encontrado' : 'libros encontrados'}
              </p>
            </div>
            {!searchQuery && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-3 sm:mt-0">
                <FiTrendingUp className="text-amber-500" />
                <span>Actualizado diariamente</span>
              </div>
            )}
          </div>

          {searching ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Buscando libros...</p>
              </div>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {books.map((book, index) => (
                <div key={book.id || `book-${index}`} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                  <BookCard book={book} showActions={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-100">
              <FiBookOpen className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No se encontraron libros</h3>
              <p className="text-gray-400 mb-4">Intenta con otra palabra clave o categoría</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  loadInitialBooks()
                }}
                className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1"
              >
                Ver libros populares <FiArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Recomendaciones */}
        {recommendations.length > 0 && !searchQuery && (
          <section className="pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <FiStar className="text-amber-500" />
                  Recomendados para ti
                </h2>
                <p className="text-gray-500 text-sm mt-1">Basado en tus gustos y tendencias</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {recommendations.slice(0, 6).map((book, index) => (
                <div key={book.id || `rec-${index}`} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                  <BookCard book={book} showActions={true} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default HomePage