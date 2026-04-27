import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHeart, FaShoppingCart, FaEye, FaCartPlus } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const BookCard = ({ book, showActions = true, onFavoriteToggle, onCartAdd, compact = false }) => {
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const getBookId = () => {
    return book?.id || book?.key?.replace('/works/', '') || `book-${Date.now()}`
  }

  const getTitle = () => {
    return book?.volumeInfo?.title || book?.title || 'Sin título'
  }

  const getAuthor = () => {
    if (book?.volumeInfo?.authors) return book.volumeInfo.authors[0]
    if (book?.author_name) return book.author_name[0]
    if (book?.author) return book.author
    return 'Autor desconocido'
  }

  const getPrice = () => {
    const price = book?.saleInfo?.listPrice?.amount || book?.price
    return typeof price === 'number' ? price : 14.99
  }

  const getRating = () => {
    return book?.volumeInfo?.averageRating || book?.ratings_average || 0
  }

  const getCoverImage = () => {
    if (imageError) {
      return 'https://placehold.co/400x600/3b82f6/white?text=Portada+no+disponible'
    }
    if (book?.volumeInfo?.imageLinks?.thumbnail) {
      return book.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
    }
    if (book?.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    }
    if (book?.coverImage) {
      return book.coverImage
    }
    return 'https://placehold.co/400x600/3b82f6/white?text=Sin+portada'
  }

  const handleAddToFavorites = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Inicia sesión para agregar a favoritos')
      return
    }
    if (onFavoriteToggle) {
      onFavoriteToggle(book)
    } else {
      toast.success('Agregado a favoritos')
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.error('Inicia sesión para agregar al carrito')
      return
    }
    
    setAddedToCart(true)
    if (onCartAdd) {
      onCartAdd(book)
    } else {
      toast.success('Agregado al carrito')
    }
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const title = getTitle()
  const author = getAuthor()
  const price = getPrice()
  const rating = getRating()
  const coverImage = getCoverImage()

  if (compact) {
    return (
      <Link to={`/libro/${getBookId()}`} className="block group">
        <div className="flex gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
          <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            <img 
              src={coverImage} 
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 truncate">
              {title}
            </h4>
            <p className="text-xs text-gray-500 truncate">{author}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-orange-600">${price.toFixed(2)}</span>
              <button
                onClick={handleAddToCart}
                className="p-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FaCartPlus className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/libro/${getBookId()}`} className="block">
        {/* Contenedor de imagen - Aspect ratio 2:3 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[2/3]">
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          
          {/* Badge de rating */}
          {rating > 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-0.5">
              <span>★</span> {rating.toFixed(1)}
            </div>
          )}
          
          {/* Badge de oferta */}
          {price < 10 && price > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-bold">
              -{Math.round((1 - price / 14.99) * 100)}%
            </div>
          )}
          
          {/* Overlay con acciones - visible en hover */}
          {showActions && (
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-2 sm:gap-3 px-2">
                <button 
                  onClick={handleAddToFavorites}
                  className="bg-white p-2 sm:p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all hover:scale-110 shadow-lg"
                  aria-label="Agregar a favoritos"
                >
                  <FaHeart className="text-sm sm:text-base" />
                </button>
                <button 
                  onClick={handleAddToCart}
                  className={`p-2 sm:p-2.5 rounded-full transition-all hover:scale-110 shadow-lg ${
                    addedToCart 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white hover:bg-orange-500 hover:text-white'
                  }`}
                  aria-label="Agregar al carrito"
                >
                  {addedToCart ? (
                    <span className="text-sm sm:text-base">✓</span>
                  ) : (
                    <FaShoppingCart className="text-sm sm:text-base" />
                  )}
                </button>
                <button 
                  className="bg-white p-2 sm:p-2.5 rounded-full hover:bg-blue-500 hover:text-white transition-all hover:scale-110 shadow-lg"
                  aria-label="Ver detalles"
                >
                  <FaEye className="text-sm sm:text-base" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Información del libro - responsive */}
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">
            {author}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base sm:text-lg font-bold text-orange-600">
                ${price.toFixed(2)}
              </span>
              {price < 14.99 && price > 0 && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  $14.99
                </span>
              )}
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-xs sm:text-sm">★</span>
                <span className="text-xs sm:text-sm text-gray-600">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default BookCard