import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAllUsers, suspendUser, updateUserRole, deleteUserById } from '../../services/supabaseClient'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { 
  FaUsers, FaBan, FaCheckCircle, FaTrash, FaEdit, FaUserPlus, 
  FaShieldAlt, FaUserCog, FaUser, FaSearch, FaEnvelope, 
  FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const SuperAdminUsersPage = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', role: 'user' })
  const [creating, setCreating] = useState(false)
  const [suspending, setSuspending] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllUsers()
    if (result.success) {
      setUsers(result.data)
      setFilteredUsers(result.data)
    } else {
      toast.error('Error al cargar usuarios')
    }
    setLoading(false)
  }

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = users.filter(user => 
        user.email?.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
      )
      setFilteredUsers(filtered)
    }
    setCurrentPage(1)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Todos los campos son requeridos')
      return
    }
    
    setCreating(true)
    // Simular creación (en producción usar API real)
    setTimeout(() => {
      toast.success(`Usuario "${formData.email}" creado exitosamente`)
      setShowCreateModal(false)
      setFormData({ email: '', password: '', fullName: '', role: 'user' })
      loadUsers()
      setCreating(false)
    }, 1000)
  }

  const handleSuspendUser = async (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'active' ? 'activar' : 'suspender'
    
    if (!window.confirm(`¿Estás seguro de que deseas ${action} al usuario "${userName}"?`)) return
    
    setSuspending(userId)
    const result = await suspendUser(userId, newStatus === 'inactive')
    if (result) {
      toast.success(`Usuario "${userName}" ${newStatus === 'active' ? 'activado' : 'suspendido'}`)
      await loadUsers()
    } else {
      toast.error(`Error al ${action} usuario`)
    }
    setSuspending(null)
  }

  const handleRoleChange = async (userId, newRole) => {
    setEditingRole(userId)
    const result = await updateUserRole(userId, newRole)
    if (result) {
      const roleName = newRole === 'superadmin' ? 'Super Admin' : newRole === 'admin' ? 'Admin' : 'Usuario'
      toast.success(`Rol actualizado a ${roleName}`)
      await loadUsers()
    } else {
      toast.error('Error al actualizar rol')
    }
    setEditingRole(null)
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${userName}"? Esta acción es irreversible.`)) return
    
    setDeleting(userId)
    const result = await deleteUserById(userId)
    if (result.success) {
      toast.success(`Usuario "${userName}" eliminado`)
      await loadUsers()
    } else {
      toast.error('Error al eliminar usuario')
    }
    setDeleting(null)
  }

  const getRoleBadge = (role) => {
    const styles = {
      superadmin: 'bg-amber-50 text-amber-700 border border-amber-200',
      admin: 'bg-blue-50 text-blue-700 border border-blue-200',
      user: 'bg-gray-50 text-gray-700 border border-gray-200'
    }
    const icons = {
      superadmin: <FaShieldAlt className="mr-1.5" size={12} />,
      admin: <FaUserCog className="mr-1.5" size={12} />,
      user: <FaUser className="mr-1.5" size={12} />
    }
    const labels = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      user: 'Usuario'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${styles[role] || styles.user}`}>
        {icons[role] || icons.user} {labels[role] || 'Usuario'}
      </span>
    )
  }

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

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
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                  <FaUsers className="text-white text-base sm:text-xl" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
                  Super Admin
                </h1>
              </div>
              <p className="text-gray-500 text-sm sm:text-base ml-12 sm:ml-14">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario registrado' : 'usuarios registrados'} en total
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all shadow-sm hover:shadow-md text-sm font-medium"
            >
              <FaUserPlus size={14} />
              Crear Usuario
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white text-gray-700 placeholder-gray-400 text-sm transition-all"
            />
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Registro
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-medium text-sm">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {user.full_name || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-gray-400 sm:hidden mt-0.5">
                            {user.email?.split('@')[0]}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <FaEnvelope className="text-gray-300 text-xs" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {editingRole === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                          autoFocus
                          onBlur={() => setEditingRole(null)}
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => setEditingRole(user.id)}
                              className="text-gray-400 hover:text-amber-500 transition-colors"
                              title="Editar rol"
                            >
                              <FaEdit size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-gray-300 text-xs" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        {user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => handleSuspendUser(user.id, user.status, user.full_name || user.email)}
                              disabled={suspending === user.id}
                              className={`p-2 rounded-lg transition-colors ${
                                user.status === 'active' 
                                  ? 'text-gray-500 hover:text-amber-500 hover:bg-amber-50' 
                                  : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                              }`}
                              title={user.status === 'active' ? 'Suspender' : 'Activar'}
                            >
                              {suspending === user.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : user.status === 'active' ? (
                                <FaBan size={14} />
                              ) : (
                                <FaCheckCircle size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                              disabled={deleting === user.id}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar usuario"
                            >
                              {deleting === user.id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FaTrash size={14} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUsers className="text-gray-300 text-2xl" />
              </div>
              <p className="text-gray-400 text-sm">No hay usuarios que coincidan con tu búsqueda</p>
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
        {filteredUsers.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Mostrando {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
          </p>
        )}

        {/* Modal Crear Usuario */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaUserPlus className="text-gray-600" />
                  Crear Nuevo Usuario
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400 transition-all"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400 transition-all"
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400 bg-white"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                      <option value="superadmin">Super Administrador</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaUserPlus size={14} />
                    )}
                    Crear Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuperAdminUsersPage