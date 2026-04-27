import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getCart, removeFromCart, clearCart } from '../../services/supabaseClient'
import { getBookById } from '../../api/booksApi'
// import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FaShoppingCart, FaTrash, FaCreditCard, FaArrowLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const UserCartPage = () => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartBooks, setCartBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    loadCart()
  }, [user])

  const loadCart = async () => {
    if (!user) return
    setLoading(true)
    
    const result = await getCart(user.id)
    if (result.success && result.data.length > 0) {
      setCartItems(result.data)
      
      // Cargar datos completos de cada libro
      const booksData = []
      for (const item of result.data) {
        const bookResult = await getBookById(item.book_id)
        if (bookResult.success && bookResult.book) {
          booksData.push(bookResult.book)
        } else {
          booksData.push({
            id: item.book_id,
            volumeInfo: {
              title: item.book_title,
              imageLinks: { thumbnail: item.book_thumbnail }
            },
            saleInfo: { listPrice: { amount: item.book_price } }
          })
        }
      }
      setCartBooks(booksData)
    } else {
      setCartItems([])
      setCartBooks([])
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
    
    // Simular proceso de compra
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

  const getTotalPrice = () => {
    let total = 0
    cartBooks.forEach(book => {
      const price = book.saleInfo?.listPrice?.amount || book.saleInfo?.retailPrice?.amount || 0
      if (typeof price === 'number') total += price
    })
    return total.toFixed(2)
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaShoppingCart className="text-primary-600" />
              Mi Carrito
            </h1>
            <p className="text-gray-600 mt-1">
              {cartBooks.length} {cartBooks.length === 1 ? 'libro' : 'libros'} en tu carrito
            </p>
          </div>
          <Link to="/" className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <FaArrowLeft size={14} /> Seguir comprando
          </Link>
        </div>

        {cartBooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaShoppingCart className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-4">Explora nuestro catálogo y agrega libros para comprar</p>
            <Link to="/" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Ver Libros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de libros */}
            <div className="lg:col-span-2 space-y-4">
              {cartBooks.map((book) => {
                const price = book.saleInfo?.listPrice?.amount || book.saleInfo?.retailPrice?.amount || 'Gratis'
                const priceText = typeof price === 'number' ? `$${price.toFixed(2)}` : price
                const thumbnail = book.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/80x120?text=No+Image'
                
                return (
                  <div key={book.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                    <Link to={`/libro/${book.id}`}>
                      <img src={thumbnail} alt={book.volumeInfo?.title} className="w-20 h-28 object-cover rounded" />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/libro/${book.id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-primary-600">
                          {book.volumeInfo?.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600">{book.volumeInfo?.authors?.join(', ') || 'Autor desconocido'}</p>
                      <p className="text-primary-600 font-bold mt-2">{priceText}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(book.id, book.volumeInfo?.title)}
                      disabled={removing === book.id}
                      className="text-gray-400 hover:text-red-500 transition-colors self-start"
                    >
                      {removing === book.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Resumen de compra */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de compra</h2>
                <div className="space-y-3 border-b pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                </div>
                <div className="flex justify-between mt-4 pb-4 border-b">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-primary-600">${getTotalPrice()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaCreditCard /> Comprar Ahora
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Al realizar la compra aceptas nuestros términos y condiciones
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCartPage
