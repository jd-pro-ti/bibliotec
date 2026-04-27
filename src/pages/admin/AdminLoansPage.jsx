import { useState, useEffect } from 'react'
import { getAllLoans, returnLoan, renewLoan } from '../../services/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { 
  FaBook, FaUser, FaCalendar, FaCheck, FaUndo, FaExclamationTriangle, 
  FaSearch, FaTimes, FaFileExport, FaEye, FaFilter, FaClock, 
  FaChartLine, FaChevronLeft, FaChevronRight, FaBookOpen, FaUserGraduate
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const AdminLoansPage = () => {
  const { userRole } = useAuth()
  const [loans, setLoans] = useState([])
  const [filteredLoans, setFilteredLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loansPerPage] = useState(10)

  const isSuperAdmin = userRole === 'superadmin'
  const headerGradient = isSuperAdmin 
    ? 'from-gray-700 via-gray-800 to-gray-900' 
    : 'from-gray-700 via-gray-800 to-gray-900'

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      loadLoans()
    }
  }, [userRole])

  useEffect(() => {
    filterLoans()
    setCurrentPage(1)
  }, [searchTerm, statusFilter, loans])

  const loadLoans = async () => {
    setLoading(true)
    const result = await getAllLoans()
    if (result.success) {
      setLoans(result.data)
      setFilteredLoans(result.data)
    } else {
      toast.error('Error al cargar los préstamos')
    }
    setLoading(false)
  }

  const filterLoans = () => {
    let filtered = [...loans]
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        filtered = filtered.filter(loan => 
          loan.status === 'active' && new Date(loan.due_date) < new Date()
        )
      } else {
        filtered = filtered.filter(loan => loan.status === statusFilter)
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(loan => 
        loan.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredLoans(filtered)
  }

  const handleReturn = async (loanId) => {
    setActionLoading(loanId)
    const result = await returnLoan(loanId)
    if (result.success) {
      toast.success('Libro devuelto exitosamente')
      await loadLoans()
      setShowModal(false)
    } else {
      toast.error('Error al devolver el libro')
    }
    setActionLoading(null)
  }

  const handleRenew = async (loanId) => {
    setActionLoading(loanId)
    const result = await renewLoan(loanId, 7)
    if (result.success) {
      toast.success('Préstamo renovado por 7 días más')
      await loadLoans()
    } else {
      toast.error('Error al renovar el préstamo')
    }
    setActionLoading(null)
  }

  const getStatusBadge = (status, dueDate) => {
    if (status === 'returned') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">Devuelto</span>
    }
    if (status === 'cancelled') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">Cancelado</span>
    }
    
    const today = new Date()
    const due = new Date(dueDate)
    if (due < today && status === 'active') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 animate-pulse">⚠️ Vencido</span>
    }
    
    const daysRemaining = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    if (daysRemaining <= 3) {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">⏰ Próximo a vencer</span>
    }
    
    return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">✓ Activo</span>
  }

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Libro', 'Usuario', 'Email', 'Fecha Préstamo', 'Fecha Devolución', 'Estado']
    const csvData = filteredLoans.map(loan => [
      loan.id,
      loan.book_title,
      loan.profiles?.full_name || 'N/A',
      loan.profiles?.email || 'N/A',
      formatDate(loan.loan_date),
      formatDate(loan.due_date),
      loan.status
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prestamos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Reporte exportado exitosamente')
  }

  // Paginación
  const indexOfLastLoan = currentPage * loansPerPage
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan)
  const totalPages = Math.ceil(filteredLoans.length / loansPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active' && new Date(l.due_date) >= new Date()).length,
    overdue: loans.filter(l => l.status === 'active' && new Date(l.due_date) < new Date()).length,
    returned: loans.filter(l => l.status === 'returned').length
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mt-4 sm:mt-6 mb-8">
          <div className={`bg-gradient-to-r ${headerGradient} rounded-2xl shadow-lg p-6 text-white`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaBook className="text-lg" />
                  </div>
                  Gestión de Préstamos
                </h1>
                <p className="text-white/80 mt-2 ml-14">
                  Administra todos los préstamos de libros del sistema
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all text-sm font-medium"
              >
                <FaFileExport size={14} />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FaBookOpen className="text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-red-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Devueltos</p>
                <p className="text-2xl font-bold text-gray-600">{stats.returned}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <FaCheck className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar por libro, usuario o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400 text-sm"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400 bg-white text-sm appearance-none"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="overdue">Vencidos</option>
                <option value="returned">Devueltos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Usuario</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Fecha Préstamo</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Devolución</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {currentLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FaBook className="text-3xl opacity-50" />
                        <p>No hay préstamos que mostrar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentLoans.map((loan) => {
                    const daysRemaining = getDaysRemaining(loan.due_date)
                    const isOverdue = daysRemaining < 0 && loan.status === 'active'
                    
                    return (
                      <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            {loan.book_thumbnail && (
                              <img 
                                src={loan.book_thumbnail} 
                                alt={loan.book_title} 
                                className="w-10 h-14 object-cover rounded-lg shadow-sm"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-800 text-sm sm:text-base">{loan.book_title}</p>
                              <p className="text-xs text-gray-400 sm:hidden">ID: {loan.book_id?.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                              <FaUserGraduate className="text-gray-500 text-xs" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-800">{loan.profiles?.full_name || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{loan.profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <FaCalendar className="text-gray-300 text-xs" />
                            <span>{formatDate(loan.loan_date)}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <FaClock className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-300'}`} />
                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {formatDate(loan.due_date)}
                            </span>
                          </div>
                          {loan.status === 'active' && !isOverdue && daysRemaining <= 3 && (
                            <p className="text-xs text-orange-500 mt-1">⚠️ {daysRemaining} días restantes</p>
                          )}
                          {isOverdue && (
                            <p className="text-xs text-red-500 mt-1">⚠️ Vencido hace {Math.abs(daysRemaining)} días</p>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {getStatusBadge(loan.status, loan.due_date)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {loan.status === 'active' && (
                              <>
                                <button
                                  onClick={() => handleReturn(loan.id)}
                                  disabled={actionLoading === loan.id}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Devolver"
                                >
                                  {actionLoading === loan.id ? (
                                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <FaCheck size={14} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRenew(loan.id)}
                                  disabled={actionLoading === loan.id}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Renovar"
                                >
                                  <FaUndo size={14} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedLoan(loan)
                                setShowModal(true)
                              }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <FaEye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredLoans.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBook className="text-gray-300 text-2xl" />
              </div>
              <p className="text-gray-400 text-sm">No hay préstamos que coincidan con tu búsqueda</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Info de paginación */}
        {filteredLoans.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Mostrando {indexOfFirstLoan + 1} - {Math.min(indexOfLastLoan, filteredLoans.length)} de {filteredLoans.length} préstamos
          </p>
        )}

        {/* Modal de detalles - Mejorado */}
        {showModal && selectedLoan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaBook className="text-gray-600" />
                  Detalles del Préstamo
                </h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="flex gap-4">
                  {selectedLoan.book_thumbnail ? (
                    <img 
                      src={selectedLoan.book_thumbnail} 
                      alt={selectedLoan.book_title} 
                      className="w-20 h-28 object-cover rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FaBook className="text-gray-300 text-2xl" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{selectedLoan.book_title}</h3>
                    <p className="text-gray-500 text-xs mt-1">ID: {selectedLoan.book_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Usuario</p>
                    <p className="font-medium text-gray-800 text-sm">{selectedLoan.profiles?.full_name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{selectedLoan.profiles?.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Rol</p>
                    <p className="font-medium text-gray-800 text-sm capitalize">{selectedLoan.profiles?.role || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Fecha préstamo</p>
                    <p className="text-gray-800 text-sm">{formatDate(selectedLoan.loan_date)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Fecha límite</p>
                    <p className="text-red-600 text-sm">{formatDate(selectedLoan.due_date)}</p>
                  </div>
                  {selectedLoan.return_date && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Fecha retorno</p>
                      <p className="text-green-600 text-sm">{formatDate(selectedLoan.return_date)}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Estado</p>
                    <p className="font-medium text-gray-800 text-sm capitalize">{selectedLoan.status}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  {selectedLoan.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleReturn(selectedLoan.id)}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Devolver Libro
                      </button>
                      <button
                        onClick={() => handleRenew(selectedLoan.id)}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Renovar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminLoansPage