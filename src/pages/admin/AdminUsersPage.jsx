import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAllUsers, deleteUserById, updateUserRole } from '../../services/supabaseClient'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FaUsers, FaTrash, FaEdit, FaUserCog, FaShieldAlt, FaUser } from 'react-icons/fa'
import toast from 'react-hot-toast'

const AdminUsersPage = () => {
  const { user: currentUser, userRole: currentUserRole } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [editingRole, setEditingRole] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const result = await getAllUsers()
    if (result.success) {
      // Filtrar para que admin no vea superadmins ni a sí mismo
      let filteredUsers = result.data
      if (currentUserRole === 'admin') {
        filteredUsers = result.data.filter(u => 
          u.id !== currentUser?.id && u.role !== 'superadmin'
        )
      }
      setUsers(filteredUsers)
    } else {
      toast.error('Error al cargar usuarios')
    }
    setLoading(false)
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
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-primary-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              {users.length} {users.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
              {currentUserRole === 'admin' && ' (solo puedes eliminar usuarios normales)'}
            </p>
          </div>
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
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
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
                        >
                          {currentUserRole === 'superadmin' && <option value="superadmin">SuperAdmin</option>}
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          {currentUserRole === 'superadmin' && user.id !== currentUser?.id && (
                            <button
                              onClick={() => setEditingRole(user.id)}
                              className="text-gray-400 hover:text-primary-600"
                            >
                              <FaEdit size={14} />
                            </button>
                          )}
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
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                          disabled={deleting === user.id}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          {deleting === user.id ? (
                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay usuarios para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage