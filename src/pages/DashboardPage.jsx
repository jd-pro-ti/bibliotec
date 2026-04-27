import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { FaUser, FaHeart, FaShoppingCart, FaUsers, FaBook, FaCrown } from 'react-icons/fa'
// import Breadcrumbs from '../components/ui/Breadcrumbs'

const DashboardPage = () => {
  const { user, userRole, userProfile } = useAuth()

  const userCards = [
    { title: 'Mis Favoritos', icon: FaHeart, path: '/usuario/favoritos', color: 'red', roles: ['user', 'admin', 'superadmin'] },
    { title: 'Mi Carrito', icon: FaShoppingCart, path: '/usuario/carrito', color: 'blue', roles: ['user', 'admin', 'superadmin'] },
  ]

  const adminCards = [
    { title: 'Gestionar Usuarios', icon: FaUsers, path: '/admin/usuarios', color: 'green', roles: ['admin', 'superadmin'] },
    { title: 'Gestionar Libros', icon: FaBook, path: '/admin/libros', color: 'purple', roles: ['admin', 'superadmin'] },
  ]

  const superAdminCards = [
    { title: 'Super Admin - Usuarios', icon: FaCrown, path: '/superadmin/usuarios', color: 'yellow', roles: ['superadmin'] },
    { title: 'Ver Logs del Sistema', icon: FaUsers, path: '/superadmin/logs', color: 'orange', roles: ['superadmin'] },
  ]

  const allCards = [...userCards, ...adminCards, ...superAdminCards].filter(card => card.roles.includes(userRole))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <FaUser className="text-primary-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">
                Bienvenido, <span className="font-semibold">{userProfile?.full_name || user?.email}</span>
              </p>
              <p className="text-sm text-gray-500 capitalize">Rol: {userRole}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.path}
                to={card.path}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Haz clic para gestionar</p>
                  </div>
                  <div className={`w-12 h-12 bg-${card.color}-100 rounded-full flex items-center justify-center`}>
                    <Icon className={`text-${card.color}-600 text-xl`} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage