import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getBookById } from '../api/booksApi'
import { addToFavorites, removeFromFavorites, addToCart, isFavorite } from '../services/supabaseClient'
// import Breadcrumbs from '../components/ui/Breadcrumbs'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { 
  FaHeart, FaShoppingCart, FaArrowLeft, FaStar, FaLanguage, 
  FaCalendar, FaUser, FaBookOpen, FaTag, FaCheck, FaShare, 
  FaDownload, FaRegBookmark, FaInfoCircle, FaCartPlus, FaPlus, FaMinus
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const BookDetailPage = () => {
  const { bookId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavoriteBook, setIsFavoriteBook] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [activeTab, setActiveTab] = useState('sinopsis')
  const [cartQuantity, setCartQuantity] = useState(1)

  const loadBook = useCallback(async () => {
    setLoading(true)
    const result = await getBookById(bookId)
    console.log('Libro cargado:', result) // Debug
    if (result.success && result.book) {
      setBook(result.book)
    } else {
      toast.error('No se pudo cargar el libro')
      navigate('/')
    }
    setLoading(false)
  }, [bookId, navigate])

  const checkIfFavorite = useCallback(async () => {
    if (!user || !book) return
    const result = await isFavorite(user.id, book.id)
    if (result.success) {
      setIsFavoriteBook(result.isFavorite)
    }
  }, [user, book])

  useEffect(() => {
    loadBook()
  }, [loadBook])

  useEffect(() => {
    if (user && book) {
      checkIfFavorite()
    }
  }, [user, book, checkIfFavorite])

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Inicia sesión para agregar a favoritos')
      navigate('/login')
      return
    }
    
    setActionLoading(true)
    try {
      if (isFavoriteBook) {
        const result = await removeFromFavorites(user.id, book.id)
        if (result.success) {
          setIsFavoriteBook(false)
          toast.success('Eliminado de favoritos')
        } else {
          toast.error('Error al eliminar de favoritos')
        }
      } else {
        const bookToSave = {
          id: book.id,
          volumeInfo: {
            title: getTitle(),
            imageLinks: { thumbnail: getThumbnail() }
          }
        }
        const result = await addToFavorites(user.id, bookToSave)
        if (result.success) {
          setIsFavoriteBook(true)
          toast.success('Agregado a favoritos')
        } else {
          toast.error('Error al agregar a favoritos')
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Error al procesar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Inicia sesión para agregar al carrito')
      navigate('/login')
      return
    }
    
    setActionLoading(true)
    try {
      const bookToSave = {
        id: book.id,
        volumeInfo: {
          title: getTitle(),
          imageLinks: { thumbnail: getThumbnail() }
        },
        saleInfo: { 
          listPrice: { 
            amount: getPrice(),
            currencyCode: 'USD' 
          } 
        },
        quantity: cartQuantity
      }
      
      console.log('Agregando al carrito:', bookToSave) // Debug
      const result = await addToCart(user.id, bookToSave)
      
      if (result.success) {
        setAddedToCart(true)
        toast.success(`${cartQuantity} libro${cartQuantity > 1 ? 's' : ''} agregado${cartQuantity > 1 ? 's' : ''} al carrito`)
        setTimeout(() => setAddedToCart(false), 3000)
      } else {
        toast.error('Error al agregar al carrito')
      }
    } catch (error) {
      console.error(error)
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

  const getTitle = () => book?.volumeInfo?.title || book?.title || 'Sin título'
  const getAuthors = () => book?.volumeInfo?.authors || book?.author_name || ['Autor desconocido']
  const getDescription = () => book?.volumeInfo?.description || (typeof book?.description === 'string' ? book.description : book?.description?.value) || 'No hay descripción disponible.'
  
  const getThumbnail = () => {
    console.log('Obteniendo imagen:', book) // Debug
    
    // Si hay error, mostrar imagen por defecto
    if (imageError) {
      return 'https://placehold.co/400x600/3b82f6/white?text=Portada+no+disponible'
    }
    
    // Intentar obtener la imagen de diferentes fuentes
    if (book?.volumeInfo?.imageLinks?.thumbnail) {
      let imgUrl = book.volumeInfo.imageLinks.thumbnail
      // Reemplazar http por https
      imgUrl = imgUrl.replace('http://', 'https://')
      return imgUrl
    }
    
    if (book?.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
    }
    
    if (book?.volumeInfo?.imageLinks?.smallThumbnail) {
      let imgUrl = book.volumeInfo.imageLinks.smallThumbnail
      imgUrl = imgUrl.replace('http://', 'https://')
      return imgUrl
    }
    
    // Imagen por defecto
    return 'https://placehold.co/400x600/3b82f6/white?text=Portada+no+disponible'
  }

  const getCategories = () => book?.volumeInfo?.categories || book?.subject?.slice(0, 3) || ['General']
  const getPageCount = () => book?.volumeInfo?.pageCount || book?.number_of_pages_median || 'N/A'
  const getPublishedDate = () => book?.volumeInfo?.publishedDate || (book?.first_publish_year ? `${book.first_publish_year}` : 'Fecha no disponible')
  const getPublisher = () => book?.volumeInfo?.publisher || book?.publisher?.[0] || 'Editorial no disponible'
  const getLanguage = () => book?.volumeInfo?.language || book?.language?.[0] || 'es'
  const getRating = () => book?.volumeInfo?.averageRating || book?.ratings_average || 0
  const getRatingsCount = () => book?.volumeInfo?.ratingsCount || book?.ratings_count || 0
  const getPrice = () => {
    const price = book?.saleInfo?.listPrice?.amount || book?.saleInfo?.retailPrice?.amount
    return typeof price === 'number' ? price : 14.99
  }
  const getPriceText = () => `$${getPrice().toFixed(2)}`

  if (loading) return <LoadingSpinner fullScreen />
  if (!book) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FaInfoCircle className="text-6xl text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Libro no encontrado</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )

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
  const isDescriptionLong = description.length > 600

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-all"
          >
            <FaArrowLeft className="text-sm sm:text-base" /> 
            <span className="text-sm sm:text-base">Volver</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <FaShare className="text-sm sm:text-base" />
            <span className="text-sm sm:text-base hidden sm:inline">Compartir</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 p-5 sm:p-6 md:p-8">
            
            {/* Columna de la imagen */}
            <div className="lg:col-span-1">
              <div className="relative rounded-xl overflow-hidden shadow-xl bg-gray-100">
                <img 
                  src={thumbnail} 
                  alt={title} 
                  className="w-full h-auto object-cover"
                  onError={() => setImageError(true)} 
                  loading="eager"
                />
                
                {/* Badges flotantes */}
                {getPrice() === 0 && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                    GRATIS
                  </div>
                )}
                
                {averageRating >= 4.5 && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                    ★ BESTSELLER
                  </div>
                )}
              </div>
              
              {/* Badges de características */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {pageCount !== 'N/A' && pageCount > 0 && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    📄 {pageCount} páginas
                  </span>
                )}
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                  🔖 ISBN: {book.id?.slice(0, 13) || 'No disponible'}
                </span>
              </div>
            </div>

            {/* Columna de información */}
            <div className="lg:col-span-2">
              {/* Título */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 leading-tight">
                {title}
              </h1>
              
              {/* Autores y metadatos */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-5">
                <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-full">
                  <FaUser size={12} className="text-gray-500" /> 
                  <span className="text-xs sm:text-sm">{authors.slice(0, 3).join(', ')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-full">
                  <FaCalendar size={12} className="text-gray-500" /> 
                  <span className="text-xs sm:text-sm">{publishedDate.slice(0, 4)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-full">
                  <FaLanguage size={12} className="text-gray-500" /> 
                  <span className="text-xs sm:text-sm">{language.toUpperCase()}</span>
                </div>
              </div>

              {/* Rating y reseñas */}
              {averageRating > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-6 p-3 sm:p-4 bg-yellow-50 rounded-xl">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`text-base sm:text-lg ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-700">
                    {averageRating.toFixed(1)} / 5
                  </span>
                  {ratingsCount > 0 && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      ({ratingsCount.toLocaleString()} reseñas)
                    </span>
                  )}
                </div>
              )}

              {/* Categorías */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.slice(0, 5).map((cat, idx) => (
                  <span key={idx} className="px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5">
                    <FaTag size={10} /> {cat}
                  </span>
                ))}
              </div>

              {/* Precio y selector de cantidad - SECCIÓN DEL CARRITO */}
              <div className="border-t-2 border-b-2 border-gray-100 py-5 my-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-600">
                        {priceText}
                      </span>
                      {typeof getPrice() === 'number' && getPrice() > 0 && (
                        <p className="text-xs text-gray-500 mt-1">IVA incluido | Envío gratis</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón de Agregar al Carrito */}
                  <button
                    onClick={handleAddToCart}
                    disabled={actionLoading}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold text-base ${
                      addedToCart
                        ? 'bg-green-600 text-white'
                        : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-[1.02]'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <FaCheck className="text-base" />
                        ¡Agregado al carrito!
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="text-base" />
                        Agregar al carrito ({cartQuantity})
                      </>
                    )}
                  </button>
                  
                  {/* Botón de Favoritos */}
                  <button
                    onClick={handleToggleFavorite}
                    disabled={actionLoading}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold text-base ${
                      isFavoriteBook
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'border-2 border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    <FaHeart className={`text-base ${isFavoriteBook ? 'fill-current' : ''}`} /> 
                    {isFavoriteBook ? 'En favoritos' : 'Agregar a favoritos'}
                  </button>
                </div>
              </div>

              {/* Tabs de información */}
              <div className="mb-6">
                <div className="flex gap-2 sm:gap-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('sinopsis')}
                    className={`pb-2 px-2 sm:px-4 text-sm sm:text-base font-medium transition-colors ${
                      activeTab === 'sinopsis'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sinopsis
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 px-2 sm:px-4 text-sm sm:text-base font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Detalles
                  </button>
                </div>

                <div className="mt-5">
                  {activeTab === 'sinopsis' && (
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaBookOpen className="text-orange-500" /> 
                        Sinopsis
                      </h2>
                      <div>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                          {expandedDescription || !isDescriptionLong 
                            ? description 
                            : `${description.slice(0, 600)}...`}
                        </p>
                        {isDescriptionLong && (
                          <button
                            onClick={() => setExpandedDescription(!expandedDescription)}
                            className="text-orange-600 hover:text-orange-700 font-medium mt-3 text-sm"
                          >
                            {expandedDescription ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaRegBookmark className="text-orange-500" /> 
                        Información detallada
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Editorial</p>
                          <p className="font-medium text-sm sm:text-base">{publisher}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Páginas</p>
                          <p className="font-medium text-sm sm:text-base">{pageCount}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Idioma</p>
                          <p className="font-medium text-sm sm:text-base capitalize">{language}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Publicación</p>
                          <p className="font-medium text-sm sm:text-base">{publishedDate}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailPage