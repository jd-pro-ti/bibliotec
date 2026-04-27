import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getCart, removeFromCart, clearCart, createLoan } from '../../services/supabaseClient'
import { getBookById } from '../../api/booksApi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { 
  FaShoppingCart, FaTrash, FaCreditCard, FaArrowLeft, FaBookOpen, 
  FaTruck, FaShieldAlt, FaClock, FaCheckCircle, FaPlus, FaMinus
} from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const UserCartPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [cartBooks, setCartBooks] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [loanLoading, setLoanLoading] = useState(null)

  useEffect(() => {
    loadCart()
  }, [user])

  const loadCart = async () => {
    if (!user) return
    setLoading(true)
    
    const result = await getCart(user.id)
    if (result.success && result.data.length > 0) {
      setCartItems(result.data)
      
      const booksData = []
      const initialQuantities = {}
      
      for (const item of result.data) {
        const bookResult = await getBookById(item.book_id)
        if (bookResult.success && bookResult.book) {
          booksData.push(bookResult.book)
          initialQuantities[bookResult.book.id] = item.quantity || 1
        } else {
          const fallbackBook = {
            id: item.book_id,
            volumeInfo: {
              title: item.book_title,
              imageLinks: { thumbnail: item.book_thumbnail }
            },
            saleInfo: { listPrice: { amount: item.book_price } }
          }
          booksData.push(fallbackBook)
          initialQuantities[item.book_id] = item.quantity || 1
        }
      }
      setCartBooks(booksData)
      setQuantities(initialQuantities)
    } else {
      setCartItems([])
      setCartBooks([])
      setQuantities({})
    }
    setLoading(false)
  }

  const handleRemoveFromCart = async (bookId, bookTitle) => {
    if (!user) return
    setRemoving(bookId)
    
    const result = await removeFromCart(user.id, bookId)
    if (result.success) {
      toast.success(`"${bookTitle}" eliminado del carrito`)
      await loadCart()
    } else {
      toast.error('Error al eliminar del carrito')
    }
    setRemoving(null)
  }

  const handleCheckout = async () => {
    if (!user) return
    setCheckoutLoading(true)
    
    setTimeout(async () => {
      const result = await clearCart(user.id)
      if (result.success) {
        toast.success('¡Compra realizada con éxito! Gracias por tu compra')
        await loadCart()
      } else {
        toast.error('Error al procesar la compra')
      }
      setCheckoutLoading(false)
    }, 1500)
  }

  const handleBorrow = async (book) => {
    if (!user) {
      toast.error('Debes iniciar sesión para pedir prestado')
      navigate('/login')
      return
    }

    setLoanLoading(book.id)
    
    const result = await createLoan(user.id, book)
    
    if (result.success) {
      const dueDate = new Date(result.data.due_date)
      toast.success(
        `"${book.volumeInfo?.title}" prestado exitosamente. Devolución: ${dueDate.toLocaleDateString()}`,
        { duration: 5000 }
      )
      await handleRemoveFromCart(book.id, book.volumeInfo?.title)
    } else {
      toast.error(result.error || 'Error al procesar el préstamo')
    }
    
    setLoanLoading(null)
  }

  const updateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return
    setQuantities(prev => ({ ...prev, [bookId]: newQuantity }))
    // Aquí puedes agregar lógica para actualizar cantidad en la base de datos
  }

  const getItemSubtotal = (book) => {
    const price = book.saleInfo?.listPrice?.amount || book.saleInfo?.retailPrice?.amount || 0
    const quantity = quantities[book.id] || 1
    return (typeof price === 'number' ? price * quantity : 0).toFixed(2)
  }

  const getTotalPrice = () => {
    let total = 0
    cartBooks.forEach(book => {
      const price = book.saleInfo?.listPrice?.amount || book.saleInfo?.retailPrice?.amount || 0
      const quantity = quantities[book.id] || 1
      if (typeof price === 'number') total += price * quantity
    })
    return total.toFixed(2)
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mt-4 sm:mt-6 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                  <FaShoppingCart className="text-white text-base sm:text-xl" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                  Mi Carrito
                </h1>
              </div>
              <p className="text-gray-500 text-sm sm:text-base ml-12 sm:ml-14">
                {cartBooks.length} {cartBooks.length === 1 ? 'libro' : 'libros'} en tu carrito
              </p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors text-sm sm:text-base bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md w-fit"
            >
              <FaArrowLeft className="text-sm" />
              Seguir comprando
            </Link>
          </div>
        </div>

        {cartBooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 md:p-16 text-center border border-gray-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingCart className="text-amber-300 text-3xl sm:text-4xl" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Explora nuestro catálogo y agrega libros para comprar o pedir prestado</p>
            <Link 
              to="/" 
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Explorar libros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Lista de libros */}
            <div className="lg:col-span-2 space-y-4">
              {cartBooks.map((book, index) => {
                const price = book.saleInfo?.listPrice?.amount || book.saleInfo?.retailPrice?.amount || 0
                const priceText = typeof price === 'number' ? `$${price.toFixed(2)}` : 'Gratis'
                const thumbnail = book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') 
                  || 'https://placehold.co/100x140/f3f4f6/9ca3af?text=Sin+portada'
                const subtotal = getItemSubtotal(book)
                
                return (
                  <div 
                    key={book.id} 
                    className="bg-white rounded-xl shadow-sm p-4 sm:p-5 flex gap-4 hover:shadow-md transition-all duration-300 border border-gray-100 animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Imagen */}
                    <Link to={`/libro/${book.id}`} className="flex-shrink-0">
                      <img 
                        src={thumbnail} 
                        alt={book.volumeInfo?.title} 
                        className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      />
                    </Link>
                    
                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/libro/${book.id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-amber-600 transition-colors text-sm sm:text-base line-clamp-2">
                          {book.volumeInfo?.title}
                        </h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {book.volumeInfo?.authors?.join(', ') || 'Autor desconocido'}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                        <div className="flex items-center gap-3">
                          <span className="text-amber-600 font-bold text-base sm:text-lg">
                            {priceText}
                          </span>
                          {price > 0 && (
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(book.id, (quantities[book.id] || 1) - 1)}
                                className="w-6 h-6 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors"
                              >
                                <FaMinus className="text-xs text-gray-600" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-gray-700">
                                {quantities[book.id] || 1}
                              </span>
                              <button
                                onClick={() => updateQuantity(book.id, (quantities[book.id] || 1) + 1)}
                                className="w-6 h-6 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors"
                              >
                                <FaPlus className="text-xs text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-700 font-medium text-sm">
                          Subtotal: <span className="text-amber-600">${subtotal}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleRemoveFromCart(book.id, book.volumeInfo?.title)}
                        disabled={removing === book.id}
                        className="text-gray-400 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        {removing === book.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaTrash className="text-sm" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleBorrow(book)}
                        disabled={loanLoading === book.id}
                        className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        {loanLoading === book.id ? (
                          <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaBookOpen className="text-xs" />
                        )}
                        <span>Pedir prestado</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Resumen de compra - Mejorado */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 sticky top-24 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCreditCard className="text-amber-500" />
                  Resumen de compra
                </h2>
                
                <div className="space-y-3 pb-4 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">${getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <FaTruck className="text-xs" /> Gratis
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="text-gray-800">Incluidos</span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4 pb-4 border-b border-gray-100">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-amber-600">${getTotalPrice()}</span>
                </div>
                
                {/* Beneficios */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaShieldAlt className="text-green-500" />
                    <span>Compra segura</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaTruck className="text-amber-500" />
                    <span>Envío gratis en todas las compras</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FaClock className="text-blue-500" />
                    <span>Entrega en 3-5 días hábiles</span>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {checkoutLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaCreditCard /> Finalizar Compra
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (cartBooks.length > 0) {
                        handleBorrow(cartBooks[0])
                      }
                    }}
                    disabled={loanLoading || cartBooks.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {loanLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaBookOpen /> Pedir Prestado (14 días)
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 text-center mt-4">
                  Los préstamos tienen una duración de 14 días. Puedes renovar por 7 días más.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Sugerencias */}
        {cartBooks.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-amber-400 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Quizás también te interese</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cartBooks.slice(0, 5).map((book, idx) => (
                <Link key={idx} to={`/libro/${book.id}`} className="text-center group">
                  <img 
                    src={book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://placehold.co/100x140/f3f4f6/9ca3af?text=Libro'} 
                    alt={book.volumeInfo?.title}
                    className="w-full aspect-[2/3] object-cover rounded-lg shadow-sm group-hover:shadow-md transition-all group-hover:scale-105"
                  />
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 group-hover:text-amber-600">
                    {book.volumeInfo?.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCartPage