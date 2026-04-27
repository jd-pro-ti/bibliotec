import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { addToFavorites, removeFromFavorites, addToCart, isFavorite } from '../../services/supabaseClient'
import { FaHeart, FaShoppingCart, FaTimes, FaStar, FaLanguage, FaCalendar, FaUser, FaBookOpen, FaTag, FaCheck, FaShare, FaDownload } from 'react-icons/fa'
import toast from 'react-hot-toast'

const BookDetailModal = ({ book, onClose, onFavorite, onAddToCart, isFavorite: initialIsFavorite }) => {
  const { user } = useAuth()
  const [isFavoriteBook, setIsFavoriteBook] = useState(initialIsFavorite || false)
  const [actionLoading, setActionLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [expandedDescription, setExpandedDescription] = useState(false)

  const getBookId = () => {
    return book?.id || book?.key?.replace('/works/', '') || `book-${Date.now()}`
  }

  const getTitle = () => {
    return book?.volumeInfo?.title || book?.title || 'Sin título'
  }

  const getAuthors = () => {
    if (book?.volumeInfo?.authors) return book.volumeInfo.authors
    if (book?.author_name) return book.author_name
    return ['Autor desconocido']
  }

  const getDescription = () => {
    if (book?.volumeInfo?.description) return book.volumeInfo.description
    if (book?.description) return typeof book.description === 'string' ? book.description : book.description?.value
    return 'No hay descripción disponible para este libro.'
  }

  const getThumbnail = () => {
    if (imageError) {
      return 'https://placehold.co/600x800/3b82f6/white?text=Portada+no+disponible'
    }
    if (book?.volumeInfo?.imageLinks?.thumbnail) {
      return book.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
    }
    if (book?.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
    }
    if (book?.volumeInfo?.imageLinks?.smallThumbnail) {
      return book.volumeInfo.imageLinks.smallThumbnail.replace('http:', 'https:')
    }
    if (book?.book_thumbnail) {
      return book.book_thumbnail
    }
    return 'https://placehold.co/600x800/3b82f6/white?text=Portada+no+disponible'
  }

  const getCategories = () => {
    if (book?.volumeInfo?.categories) return book.volumeInfo.categories
    if (book?.subject) return book.subject.slice(0, 3)
    return ['General']
  }

  const getPageCount = () => {
    return book?.volumeInfo?.pageCount || book?.number_of_pages_median || 'N/A'
  }

  const getPublishedDate = () => {
    if (book?.volumeInfo?.publishedDate) return book.volumeInfo.publishedDate
    if (book?.first_publish_year) return `${book.first_publish_year}`
    return 'Fecha no disponible'
  }

  const getPublisher = () => {
    if (book?.volumeInfo?.publisher) return book.volumeInfo.publisher
    if (book?.publisher) return book.publisher[0]
    return 'Editorial no disponible'
  }

  const getLanguage = () => {
    return book?.volumeInfo?.language || book?.language?.[0] || 'es'
  }

  const getRating = () => {
    return book?.volumeInfo?.averageRating || book?.ratings_average || 0
  }

  const getRatingsCount = () => {
    return book?.volumeInfo?.ratingsCount || book?.ratings_count || 0
  }

  const getPrice = () => {
    const price = book?.saleInfo?.listPrice?.amount || book?.saleInfo?.retailPrice?.amount
    if (typeof price === 'number') return price
    return 14.99
  }

  const getPriceText = () => {
    const price = getPrice()
    if (price === 'Gratis') return 'Gratis'
    return `$${price.toFixed(2)}`
  }

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && !initialIsFavorite) {
        const result = await isFavorite(user.id, getBookId())
        if (result.success) {
          setIsFavoriteBook(result.isFavorite)
        }
      }
    }
    checkFavoriteStatus()
  }, [user, book])

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Inicia sesión para agregar a favoritos')
      return
    }
    
    setActionLoading(true)
    try {
      if (isFavoriteBook) {
        const result = await removeFromFavorites(user.id, getBookId())
        if (result.success) {
          setIsFavoriteBook(false)
          onFavorite?.(book)
          toast.success('Eliminado de favoritos')
        } else {
          toast.error('Error al eliminar de favoritos')
        }
      } else {
        const bookToSave = {
          id: getBookId(),
          volumeInfo: {
            title: getTitle(),
            imageLinks: { thumbnail: getThumbnail() }
          }
        }
        const result = await addToFavorites(user.id, bookToSave)
        if (result.success) {
          setIsFavoriteBook(true)
          onFavorite?.(book)
          toast.success('Agregado a favoritos')
        } else {
          toast.error('Error al agregar a favoritos')
        }
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Inicia sesión para agregar al carrito')
      return
    }
    
    setActionLoading(true)
    try {
      const bookToSave = {
        id: getBookId(),
        volumeInfo: {
          title: getTitle(),
          imageLinks: { thumbnail: getThumbnail() }
        },
        saleInfo: { 
          listPrice: { 
            amount: getPrice(),
            currencyCode: 'USD' 
          } 
        }
      }
      const result = await addToCart(user.id, bookToSave)
      if (result.success) {
        setAddedToCart(true)
        onAddToCart?.(book)
        toast.success('¡Libro agregado al carrito!')
        setTimeout(() => setAddedToCart(false), 2000)
      } else {
        toast.error('Error al agregar al carrito')
      }
    } catch (error) {
      toast.error('Error al agregar al carrito')
    } finally {
      setActionLoading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: getTitle(),
      text: `Mira este libro: ${getTitle()}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Enlace copiado al portapapeles')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Enlace copiado al portapapeles')
    }
  }

  const title = getTitle()
  const authors = getAuthors()
  const description = getDescription()
  const thumbnail = getThumbnail()
  const categories = getCategories()
  const pageCount = getPageCount()
  const publishedDate = getPublishedDate()
  const publisher = getPublisher()
  const language = getLanguage()
  const averageRating = getRating()
  const ratingsCount = getRatingsCount()
  const priceText = getPriceText()
  const isDescriptionLong = description.length > 500

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="sticky top-3 right-3 z-10 float-right p-2 bg-white/95 hover:bg-gray-100 rounded-full shadow-md transition-all hover:scale-110"
          aria-label="Cerrar"
        >
          <FaTimes className="text-gray-600 text-sm sm:text-base" />
        </button>

        <div className="clear-both" />

        <div className="p-5 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Columna de la imagen */}
            <div className="md:col-span-1">
              <div className="sticky top-4">
                <div className="relative rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-auto object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
                
                {/* Badges adicionales */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {getPrice() === 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      ¡Gratis!
                    </span>
                  )}
                  {pageCount !== 'N/A' && pageCount > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {pageCount} páginas
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Columna de la información */}
            <div className="md:col-span-2">
              {/* Título */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 leading-tight">
                {title}
              </h1>
              
              {/* Autores y metadatos */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                  <FaUser size={12} className="text-gray-500" /> 
                  <span>{authors.slice(0, 3).join(', ')}{authors.length > 3 && '...'}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                  <FaCalendar size={12} className="text-gray-500" /> 
                  <span>{publishedDate.slice(0, 4)}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                  <FaLanguage size={12} className="text-gray-500" /> 
                  <span>{language.toUpperCase()}</span>
                </span>
              </div>

              {/* Rating */}
              {averageRating > 0 && (
                <div className="flex items-center gap-3 mb-5 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`text-base sm:text-lg ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {averageRating.toFixed(1)} / 5
                  </span>
                  {ratingsCount > 0 && (
                    <span className="text-xs text-gray-500">
                      ({ratingsCount} reseñas)
                    </span>
                  )}
                </div>
              )}

              {/* Categorías */}
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.slice(0, 5).map((cat, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5">
                    <FaTag size={10} /> {cat}
                  </span>
                ))}
              </div>

              {/* Precio y acciones */}
              <div className="border-t border-b border-gray-200 py-5 my-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-3xl sm:text-4xl font-bold text-primary-600">{priceText}</span>
                    {typeof getPrice() === 'number' && getPrice() > 0 && (
                      <p className="text-xs text-gray-500 mt-1">IVA incluido</p>
                    )}
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleToggleFavorite}
                      disabled={actionLoading}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl transition-all font-medium ${
                        isFavoriteBook
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'border-2 border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-500'
                      }`}
                    >
                      <FaHeart className={isFavoriteBook ? 'fill-current' : ''} /> 
                      {isFavoriteBook ? 'Favorito' : 'Favoritos'}
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={actionLoading}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl transition-all font-medium ${
                        addedToCart
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {addedToCart ? <FaCheck /> : <FaShoppingCart />}
                      {addedToCart ? 'Agregado' : 'Agregar'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2.5 rounded-xl border-2 border-gray-300 text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-all"
                      aria-label="Compartir"
                    >
                      <FaShare className="text-sm sm:text-base" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sinopsis */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBookOpen className="text-primary-500" /> 
                  Sinopsis
                </h2>
                <div className="prose prose-sm sm:prose-base max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {expandedDescription || !isDescriptionLong 
                      ? description 
                      : `${description.slice(0, 500)}...`}
                  </p>
                  {isDescriptionLong && (
                    <button
                      onClick={() => setExpandedDescription(!expandedDescription)}
                      className="text-primary-600 hover:text-primary-700 font-medium mt-2 text-sm"
                    >
                      {expandedDescription ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Editorial</p>
                  <p className="font-medium text-sm sm:text-base">{publisher}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Páginas</p>
                  <p className="font-medium text-sm sm:text-base">{pageCount}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Idioma</p>
                  <p className="font-medium text-sm sm:text-base capitalize">{language}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ISBN</p>
                  <p className="font-medium text-sm sm:text-base">978-{Math.floor(Math.random() * 1000000000000)}</p>
                </div>
              </div>

              {/* Botón de descarga (opcional) */}
              <div className="mt-6">
                <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium flex items-center justify-center gap-2">
                  <FaDownload className="text-sm" />
                  Descargar muestra gratis (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailModal