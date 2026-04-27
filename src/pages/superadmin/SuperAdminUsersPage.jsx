import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAllUsers, suspendUser, updateUserRole, deleteUserById } from '../../services/supabaseClient'
// import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FaUsers, FaBan, FaCheckCircle, FaTrash, FaEdit, FaUserPlus, FaShieldAlt, FaUserCog, FaUser } from 'react-icons/fa'
import toast from 'react-hot-toast'

const SuperAdminUsersPage = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', role: 'user' })
  const [creating, setCreating] = useState(false)
  const [suspending, setSuspending] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [editingRole, setEditingRole] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllUsers()
    if (result.success) {
      setUsers(result.data)
    } else {
      toast.error('Error al cargar usuarios')
    }
    setLoading(false)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Todos los campos son requeridos')
      return
    }
    
    setCreating(true)
    // Nota: Para crear usuarios desde el frontend necesitas usar una cloud function
    // o hacerlo directamente desde Supabase Admin (requiere service_role key)
    toast.success(`Usuario "${formData.email}" creado (demo) - En producción usar Supabase Admin API`)
    setShowCreateModal(false)
    setFormData({ email: '', password: '', fullName: '', role: 'user' })
    setCreating(false)
  }

  const handleSuspendUser = async (userId, currentStatus, userName) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'active' ? 'activar' : 'suspender'
    
    if (!confirm(`¿Estás seguro de que deseas ${action} al usuario "${userName}"?`)) return
    
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
      toast.success(`Rol actualizado a ${newRole}`)
      await loadUsers()
    } else {
      toast.error('Error al actualizar rol')
    }
    setEditingRole(null)
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de eliminar a "${userName}"? Esta acción es irreversible.`)) return
    
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
      superadmin: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    }
    const icons = {
      superadmin: <FaShieldAlt className="mr-1" size={12} />,
      admin: <FaUserCog className="mr-1" size={12} />,
      user: <FaUser className="mr-1" size={12} />
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {icons[role]} {role}
      </span>
    )
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
              <FaUsers className="text-yellow-600" />
              Super Admin - Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              {users.length} {users.length === 1 ? 'usuario registrado' : 'usuarios registrados'} en total
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-700 transition-colors"
          >
            <FaUserPlus /> Crear Usuario
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-600 font-medium">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.full_name || 'Sin nombre'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingRole === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                          autoFocus
                          onBlur={() => setEditingRole(null)}
                        >
                          <option value="superadmin">SuperAdmin</option>
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          <button
                            onClick={() => setEditingRole(user.id)}
                            className="text-gray-400 hover:text-yellow-600"
                          >
                            <FaEdit size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => handleSuspendUser(user.id, user.status, user.full_name || user.email)}
                              disabled={suspending === user.id}
                              className={`p-2 rounded-lg transition-colors ${
                                user.status === 'active' 
                                  ? 'text-orange-600 hover:bg-orange-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={user.status === 'active' ? 'Suspender' : 'Activar'}
                            >
                              {suspending === user.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : user.status === 'active' ? (
                                <FaBan />
                              ) : (
                                <FaCheckCircle />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                              disabled={deleting === user.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              {deleting === user.id ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FaTrash />
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
        </div>

        {/* Modal Crear Usuario */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaUserPlus className="text-yellow-600" />
                Crear Nuevo Usuario
              </h2>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                      <option value="superadmin">SuperAdministrador</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                  >
                    {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaUserPlus />}
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