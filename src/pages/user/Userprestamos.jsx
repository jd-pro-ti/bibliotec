import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getUserLoans } from '../../services/supabaseClient'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { 
  FaBook, FaCalendar, FaClock, FaCheckCircle, 
  FaExclamationTriangle, FaUndo, FaBookOpen, 
  FaSearch, FaFilter, FaTimes 
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const UserLoansPage = () => {
  const { user } = useAuth()
  const [loans, setLoans] = useState([])
  const [filteredLoans, setFilteredLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (user) {
      loadLoans()
    }
  }, [user])

  useEffect(() => {
    filterLoans()
  }, [searchTerm, statusFilter, loans])

  const loadLoans = async () => {
    setLoading(true)
    const result = await getUserLoans(user.id)
    if (result.success) {
      setLoans(result.data)
      setFilteredLoans(result.data)
    } else {
      toast.error('Error al cargar tus préstamos')
    }
    setLoading(false)
  }

  const filterLoans = () => {
    let filtered = [...loans]
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter)
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(loan => 
        loan.book_title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredLoans(filtered)
  }

  const getStatusInfo = (loan) => {
    if (loan.status === 'returned') {
      return { 
        text: 'Devuelto', 
        color: 'text-gray-600', 
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        icon: FaCheckCircle,
        description: 'Libro devuelto satisfactoriamente'
      }
    }
    if (loan.status === 'cancelled') {
      return { 
        text: 'Cancelado', 
        color: 'text-red-600', 
        bg: 'bg-red-100',
        border: 'border-red-200',
        icon: FaTimes,
        description: 'Préstamo cancelado'
      }
    }
    
    const today = new Date()
    const dueDate = new Date(loan.due_date)
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    
    if (dueDate < today) {
      return { 
        text: 'Vencido', 
        color: 'text-red-600', 
        bg: 'bg-red-100',
        border: 'border-red-200',
        icon: FaExclamationTriangle,
        description: `Vencido hace ${Math.abs(daysRemaining)} días. Por favor devuelve el libro.`
      }
    }
    
    if (daysRemaining <= 3) {
      return { 
        text: `Próximo a vencer (${daysRemaining} días)`, 
        color: 'text-orange-600', 
        bg: 'bg-orange-100',
        border: 'border-orange-200',
        icon: FaClock,
        description: `Quedan ${daysRemaining} días para la devolución`
      }
    }
    
    return { 
      text: 'Activo', 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      border: 'border-green-200',
      icon: FaCheckCircle,
      description: `Préstamo activo. Devolución en ${daysRemaining} días`
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active' && new Date(l.due_date) >= new Date()).length,
    overdue: loans.filter(l => l.status === 'active' && new Date(l.due_date) < new Date()).length,
    returned: loans.filter(l => l.status === 'returned').length
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <FaBookOpen className="text-primary-600 text-2xl" />
                </div>
                Mis Préstamos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona y da seguimiento a tus libros prestados
              </p>
            </div>
            <Link 
              to="/" 
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2 w-fit"
            >
              <FaBook className="text-sm" />
              Explorar más libros
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-primary-500">
            <p className="text-gray-500 text-sm">Total préstamos</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Préstamos activos</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Vencidos</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
            <p className="text-gray-500 text-sm">Devueltos</p>
            <p className="text-2xl font-bold text-gray-600">{stats.returned}</p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título del libro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FaFilter className="text-gray-500" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="returned">Devueltos</option>
                <option value="overdue">Vencidos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de préstamos */}
        {filteredLoans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaBookOpen className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No hay préstamos para mostrar</h2>
            <p className="text-gray-500 mb-4">
              {loans.length === 0 
                ? "Aún no has tomado ningún libro en préstamo" 
                : "No hay préstamos que coincidan con los filtros"}
            </p>
            {loans.length === 0 && (
              <Link to="/" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-block">
                Explorar Catálogo
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLoans.map((loan) => {
              const statusInfo = getStatusInfo(loan)
              const StatusIcon = statusInfo.icon
              const daysRemaining = getDaysRemaining(loan.due_date)
              
              return (
                <div 
                  key={loan.id} 
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border-l-4 ${statusInfo.border}`}
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Imagen del libro */}
                      <div className="flex-shrink-0">
                        {loan.book_thumbnail ? (
                          <img 
                            src={loan.book_thumbnail} 
                            alt={loan.book_title} 
                            className="w-24 h-32 object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <FaBook className="text-gray-400 text-3xl" />
                          </div>
                        )}
                      </div>
                      
                      {/* Información del libro */}
                      <div className="flex-1">
                        <Link to={`/libro/${loan.book_id}`}>
                          <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 text-lg">
                            {loan.book_title}
                          </h3>
                        </Link>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendar className="text-primary-500" />
                            <span className="font-medium">Préstamo:</span>
                            <span>{formatDate(loan.loan_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaCalendar className="text-red-500" />
                            <span className="font-medium text-gray-700">Devolución:</span>
                            <span className={daysRemaining < 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {formatDate(loan.due_date)}
                            </span>
                          </div>
                          
                          {loan.status === 'active' && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaClock className="text-orange-500" />
                              <span className="font-medium text-gray-700">Días restantes:</span>
                              <span className={daysRemaining < 0 ? 'text-red-600 font-bold' : daysRemaining <= 3 ? 'text-orange-600 font-semibold' : 'text-green-600'}>
                                {daysRemaining < 0 ? 'Vencido' : `${daysRemaining} días`}
                              </span>
                            </div>
                          )}
                          
                          {loan.return_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FaCheckCircle className="text-green-500" />
                              <span className="font-medium">Devuelto:</span>
                              <span>{formatDate(loan.return_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Estado y acciones */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color} flex items-center gap-2`}>
                          <StatusIcon size={14} />
                          <span>{statusInfo.text}</span>
                        </div>
                        
                        {loan.status === 'active' && (
                          <div className="flex gap-2">
                            {daysRemaining <= 3 && daysRemaining >= 0 && (
                              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                ¡Préstamo próximo a vencer!
                              </div>
                            )}
                            {daysRemaining < 0 && (
                              <Link 
                                to="/contacto"
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                              >
                                Contactar soporte →
                              </Link>
                            )}
                          </div>
                        )}
                        
                        {loan.status === 'returned' && (
                          <Link 
                            to={`/libro/${loan.book_id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                          >
                            Leer reseñas →
                          </Link>
                        )}
                      </div>
                      
                      {/* Descripción del estado */}
                      <p className="text-xs text-gray-500 mt-2">
                        {statusInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Mensaje de información adicional */}
        {stats.active > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaClock className="text-blue-500 text-lg mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Información importante</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Los préstamos tienen una duración de 14 días. Puedes renovar tu préstamo contactando al administrador. 
                  Recuerda devolver los libros a tiempo para evitar multas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserLoansPage