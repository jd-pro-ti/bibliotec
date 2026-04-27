import { useState, useEffect } from 'react'
import { searchBooks } from '../../api/booksApi'
import BookCard from '../../components/books/BookCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FaBook, FaSearch, FaFilter, FaTrash, FaTags } from 'react-icons/fa'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'all', 'fiction', 'science fiction', 'fantasy', 'mystery', 
  'romance', 'history', 'biography', 'children', 'computers'
]

const AdminBooksPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCategoryModal, setShowCategoryModal] = useState(null)

  const loadBooks = async (query = 'bestsellers') => {
    setLoading(true)
    const result = await searchBooks(query, 0, 24)
    if (result.success) {
      setBooks(result.books)
    } else {
      toast.error('Error al cargar libros')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBooks()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    await loadBooks(searchQuery)
  }

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category)
    if (category === 'all') {
      await loadBooks('bestsellers')
    } else {
      await loadBooks(`subject:${category}`)
    }
  }

  const handleRemoveBook = (book) => {
    if (confirm(`¿Quieres eliminar "${book.volumeInfo?.title}" de los resultados? Esto solo oculta el libro de esta vista.`)) {
      setBooks(prev => prev.filter(b => b.id !== book.id))
      toast.success(`"${book.volumeInfo?.title}" removido de la vista`)
    }
  }

  const handleChangeCategory = (book) => {
    setShowCategoryModal(book)
  }

  const handleAssignCategory = (book, newCategory) => {
    toast.success(`"${book.volumeInfo?.title}" movido a categoría "${newCategory}" (simulado)`)
    setShowCategoryModal(null)
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaBook className="text-primary-600" />
              Gestión de Libros
            </h1>
            <p className="text-gray-600 mt-1">Administra el catálogo de libros</p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar libros por título, autor o categoría..."
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Buscar
            </button>
          </form>
        </div>

        {/* Filtro de categorías */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-gray-500" />
            <span className="font-medium text-gray-700">Filtrar por categoría:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de libros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {books.map((book) => (
            <div key={book.id} className="relative group">
              <BookCard book={book} showActions={false} />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleChangeCategory(book)}
                  className="bg-white rounded-full p-1.5 shadow-md hover:bg-primary-50"
                  title="Cambiar categoría"
                >
                  <FaTags className="text-primary-600 text-xs" />
                </button>
                <button
                  onClick={() => handleRemoveBook(book)}
                  className="bg-white rounded-full p-1.5 shadow-md hover:bg-red-50"
                  title="Quitar de la vista"
                >
                  <FaTrash className="text-red-500 text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No se encontraron libros</p>
          </div>
        )}

        {/* Modal para cambiar categoría */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Cambiar categoría</h3>
              <p className="text-gray-600 mb-4">
                Libro: <span className="font-medium">{showCategoryModal.volumeInfo?.title}</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.filter(c => c !== 'all').map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleAssignCategory(showCategoryModal, cat)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-primary-100"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCategoryModal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBooksPage