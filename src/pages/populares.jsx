import { useState, useEffect, useCallback } from 'react'
import { searchBooks } from '../api/booksApi'
import BookCard from '../components/books/BookCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { FiTrendingUp, FiBookOpen, FiStar, FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

const PopularesPage = () => {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('todos')

  const categories = [
    { id: 'todos', name: 'Todos', query: 'libros populares' },
    { id: 'fiction', name: 'Ficción', query: 'fiction best sellers' },
    { id: 'fantasy', name: 'Fantasía', query: 'fantasy books' },
    { id: 'science', name: 'Ciencia Ficción', query: 'science fiction' },
    { id: 'romance', name: 'Romance', query: 'romance novels' },
    { id: 'history', name: 'Historia', query: 'history books' },
    { id: 'biography', name: 'Biografías', query: 'biography' },
    { id: 'classics', name: 'Clásicos', query: 'classic literature' }
  ]

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

  const loadBooks = useCallback(async (category) => {
    setLoading(true)
    setError(null)
    try {
      const categoryData = categories.find(c => c.id === category)
      const query = categoryData?.query || 'libros populares'
      
      const result = await searchBooks(query, 0, 24)
      const normalizedBooks = normalizeBooksWithImages(result.books || result)
      
      setBooks(normalizedBooks)
      
      if (!result.success) {
        setError('Mostrando resultados limitados. Puede haber problemas de conexión.')
      }
    } catch (err) {
      console.error('Error loading popular books:', err)
      setError('Error al cargar los libros populares')
    } finally {
      setLoading(false)
    }
  }, [normalizeBooksWithImages])

  useEffect(() => {
    loadBooks(activeCategory)
  }, [activeCategory, loadBooks])

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId)
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
              <span>Inicio</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-amber-600 font-medium">Libros Populares</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-100/50 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6">
              <FiTrendingUp className="text-amber-600 text-sm" />
              <span className="text-xs font-medium text-amber-700">Los más leídos</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Libros <span className="text-amber-600">Populares</span>
            </h1>
            
            <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
              Descubre los libros más leídos y mejor valorados por nuestra comunidad.
              Encuentra tu próxima lectura favorita.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Categorías */}
        <section className="mb-10">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                  activeCategory === category.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        {/* Resultados */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {books.length} {books.length === 1 ? 'libro encontrado' : 'libros encontrados'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-3 sm:mt-0">
              <FiStar className="text-amber-500" />
              <span>Los más valorados primero</span>
            </div>
          </div>

          {books.length > 0 ? (
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
              <p className="text-gray-400 mb-4">Intenta con otra categoría</p>
              <button
                onClick={() => handleCategoryChange('todos')}
                className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1"
              >
                Ver todos los libros
              </button>
            </div>
          )}
        </section>

        {/* Separador decorativo */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className="flex justify-center">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopularesPage