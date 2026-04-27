import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAllUsers, deleteUserById, updateUserRole } from '../../services/supabaseClient'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { 
  FaUsers, FaTrash, FaEdit, FaUserCog, FaShieldAlt, FaUser, 
  FaSearch, FaChevronLeft, FaChevronRight, FaEnvelope, FaCalendarAlt
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const AdminUsersPage = () => {
  const { user: currentUser, userRole: currentUserRole } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
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
      let filteredUsers = result.data
      if (currentUserRole === 'admin') {
        filteredUsers = result.data.filter(u => 
          u.id !== currentUser?.id && u.role !== 'superadmin'
        )
      }
      setUsers(filteredUsers)
      setFilteredUsers(filteredUsers)
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

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return
    }
    
    setDeleting(userId)
    const result = await deleteUserById(userId)
    if (result.success) {
      toast.success(`Usuario "${userName}" eliminado correctamente`)
      await loadUsers()
    } else {
      toast.error('Error al eliminar usuario')
    }
    setDeleting(null)
  }

  const handleRoleChange = async (userId, newRole) => {
    setEditingRole(userId)
    const result = await updateUserRole(userId, newRole)
    if (result) {
      toast.success(`Rol actualizado a ${newRole}`)
      await loadUsers()
    } else {
      toast.error('Error al actualizar rol')
    }
    setEditingRole(null)
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
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${styles[role]}`}>
        {icons[role]} {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
      </span>
    )
  }

  const getRoleOptions = () => {
    if (currentUserRole === 'superadmin') {
      return ['user', 'admin', 'superadmin']
    }
    return ['user', 'admin']
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
        
        
        {/* Header */}
        <div className="mt-4 sm:mt-6 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                  <FaUsers className="text-white text-base sm:text-xl" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
                  Gestión de Usuarios
                </h1>
              </div>
              <p className="text-gray-500 text-sm sm:text-base ml-12 sm:ml-14">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
                {currentUserRole === 'admin' && ' · Solo puedes gestionar usuarios normales'}
              </p>
            </div>
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
                        >
                          {getRoleOptions().map(role => (
                            <option key={role} value={role}>
                              {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          {(currentUserRole === 'superadmin' || (currentUserRole === 'admin' && user.role !== 'admin')) && 
                           user.id !== currentUser?.id && (
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
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-gray-300 text-xs" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                          disabled={deleting === user.id}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Eliminar usuario"
                        >
                          {deleting === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FaTrash size={16} />
                          )}
                        </button>
                      )}
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
                        ? 'bg-amber-500 text-white'
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
      </div>
    </div>
  )
}

export default AdminUsersPage