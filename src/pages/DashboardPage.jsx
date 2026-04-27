import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FaUser, FaHeart, FaShoppingCart, FaUsers, FaCrown, FaClipboardList, FaBookOpen, FaChartLine, FaCalendarAlt } from 'react-icons/fa'
import { getAllLoans } from '../services/supabaseClient'

const DashboardPage = () => {
  const { user, userRole, userProfile } = useAuth()
  const [loansData, setLoansData] = useState([])
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    returnedLoans: 0,
    overdueLoans: 0,
    monthlyLoans: []
  })
  const [loading, setLoading] = useState(true)

  const isSuperAdmin = userRole === 'superadmin'
  const isAdmin = userRole === 'admin'
  const isUser = userRole === 'user'

  useEffect(() => {
    if (isSuperAdmin || isAdmin) {
      loadLoansData()
    }
  }, [userRole])

  const loadLoansData = async () => {
    setLoading(true)
    try {
      const result = await getAllLoans()
      if (result.success && result.data) {
        setLoansData(result.data)
        
        // Calcular estadísticas básicas
        const active = result.data.filter(l => l.status === 'active' && new Date(l.due_date) >= new Date()).length
        const returned = result.data.filter(l => l.status === 'returned').length
        const overdue = result.data.filter(l => l.status === 'active' && new Date(l.due_date) < new Date()).length
        
        // Préstamos por mes (últimos 6 meses)
        const monthCounts = {}
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        
        // Inicializar últimos 6 meses
        const today = new Date()
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const key = `${date.getFullYear()}-${date.getMonth()}`
          monthCounts[key] = {
            count: 0,
            month: months[date.getMonth()],
            year: date.getFullYear(),
            shortMonth: months[date.getMonth()].substring(0, 3),
            order: i
          }
        }
        
        // Contar préstamos por mes
        result.data.forEach(loan => {
          const date = new Date(loan.loan_date)
          const key = `${date.getFullYear()}-${date.getMonth()}`
          if (monthCounts[key]) {
            monthCounts[key].count++
          } else {
            // Si es un mes fuera del rango, lo ignoramos para la gráfica
          }
        })
        
        const monthlyLoans = Object.values(monthCounts).sort((a, b) => a.order - b.order)
        
        setStats({
          totalLoans: result.data.length,
          activeLoans: active,
          returnedLoans: returned,
          overdueLoans: overdue,
          monthlyLoans: monthlyLoans
        })
      }
    } catch (error) {
      console.error('Error loading loans data:', error)
    }
    setLoading(false)
  }

  // Encontrar el valor máximo para la escala de la gráfica
  const maxCount = Math.max(...stats.monthlyLoans.map(m => m.count), 1)

  // Tarjetas para Usuario Normal
  const userCards = [
    { title: 'Mis Favoritos', icon: FaHeart, path: '/usuario/favoritos', color: 'red', description: 'Libros que te gustaron' },
    { title: 'Mi Carrito', icon: FaShoppingCart, path: '/usuario/carrito', color: 'blue', description: 'Libros para comprar' },
    { title: 'Mis Préstamos', icon: FaBookOpen, path: '/usuario/prestamos', color: 'green', description: 'Libros que tienes prestados' },
  ]

  // Tarjetas para Administrador
  const adminCards = [
    { title: 'Gestionar Usuarios', icon: FaUsers, path: '/admin/usuarios', color: 'blue', description: 'Administrar cuentas de usuarios' },
    { title: 'Gestionar Préstamos', icon: FaClipboardList, path: '/admin/prestamos', color: 'green', description: 'Ver y gestionar préstamos' },
  ]

  // Tarjetas para SuperAdministrador
  const superAdminCards = [
    { title: 'Admin Usuarios', icon: FaUsers, path: '/superadmin/usuarios', color: 'yellow', description: 'Control total de usuarios' },
    { title: 'Gestionar Préstamos', icon: FaClipboardList, path: '/superadmin/prestamos', color: 'green', description: 'Ver todos los préstamos' },
  ]

  let cardsToShow = []
  if (isUser) {
    cardsToShow = userCards
  } else if (isAdmin) {
    cardsToShow = adminCards
  } else if (isSuperAdmin) {
    cardsToShow = superAdminCards
  }

  const getDashboardTitle = () => {
    if (isSuperAdmin) return 'Panel de Control - Super Administrador'
    if (isAdmin) return 'Panel de Control - Administrador'
    return 'Mi Panel de Control'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Información del usuario */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
              <FaUser className="text-amber-600 text-2xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{getDashboardTitle()}</h1>
              <p className="text-gray-600">
                Bienvenido, <span className="font-semibold">{userProfile?.full_name || user?.email?.split('@')[0]}</span>
              </p>
              <p className="text-sm text-gray-500 capitalize">Rol: {userRole === 'superadmin' ? 'Super Administrador' : userRole === 'admin' ? 'Administrador' : 'Usuario'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Miembro desde</p>
              <p className="text-sm font-medium text-gray-700">
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Nuevo miembro'}
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cardsToShow.map((card) => {
            const Icon = card.icon
            const colorClasses = {
              red: 'bg-red-100 text-red-600',
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              yellow: 'bg-yellow-100 text-yellow-600',
              orange: 'bg-orange-100 text-orange-600',
              purple: 'bg-purple-100 text-purple-600'
            }
            
            return (
              <Link
                key={card.path}
                to={card.path}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 group border border-gray-100 hover:border-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{card.description}</p>
                    <span className="inline-block mt-3 text-xs text-primary-600 group-hover:translate-x-1 transition-transform">
                      Gestionar →
                    </span>
                  </div>
                  <div className={`w-12 h-12 ${colorClasses[card.color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="text-xl" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Estadísticas y Gráfica - Solo para Admin y SuperAdmin */}
        {(isAdmin || isSuperAdmin) && !loading && (
          <>
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Préstamos</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalLoans}</p>
                  </div>
                  <FaBookOpen className="text-blue-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Préstamos Activos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeLoans}</p>
                  </div>
                  <FaClipboardList className="text-green-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Devueltos</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.returnedLoans}</p>
                  </div>
                  <FaBookOpen className="text-orange-500 text-2xl" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Vencidos</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdueLoans}</p>
                  </div>
                  <FaCalendarAlt className="text-red-500 text-2xl" />
                </div>
              </div>
            </div>

            {/* Gráfica de préstamos por mes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaChartLine className="text-primary-600" />
                    Préstamos por Mes
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Evolución de préstamos en los últimos 6 meses</p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Datos en tiempo real
                </div>
              </div>

              {stats.monthlyLoans.length > 0 && stats.monthlyLoans.some(m => m.count > 0) ? (
                <div>
                  {/* Gráfica con barras horizontales más confiables */}
                  <div className="space-y-4">
                    {stats.monthlyLoans.map((item, index) => {
                      const percentage = (item.count / maxCount) * 100
                      return (
                        <div key={index} className="group">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-600">
                              {item.shortMonth} {item.year}
                            </span>
                            <span className="text-sm font-semibold text-primary-600">
                              {item.count} {item.count === 1 ? 'préstamo' : 'préstamos'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-8 rounded-full flex items-center justify-end px-3 transition-all duration-700 ease-out"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 15 && (
                                <span className="text-white text-xs font-medium">
                                  {item.count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Información de tendencia */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Total últimos 6 meses</p>
                        <p className="text-xl font-bold text-gray-800">
                          {stats.monthlyLoans.reduce((sum, m) => sum + m.count, 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Promedio mensual</p>
                        <p className="text-xl font-bold text-gray-800">
                          {(stats.monthlyLoans.reduce((sum, m) => sum + m.count, 0) / stats.monthlyLoans.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Tendencia</p>
                        <p className={`text-xl font-bold flex items-center gap-1 ${
                          stats.monthlyLoans.length >= 2 && stats.monthlyLoans[stats.monthlyLoans.length - 1].count > stats.monthlyLoans[0].count 
                            ? 'text-green-600' 
                            : stats.monthlyLoans.length >= 2 && stats.monthlyLoans[stats.monthlyLoans.length - 1].count < stats.monthlyLoans[0].count
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {stats.monthlyLoans.length >= 2 && stats.monthlyLoans[stats.monthlyLoans.length - 1].count > stats.monthlyLoans[0].count ? '↑ Aumentando' : 
                           stats.monthlyLoans.length >= 2 && stats.monthlyLoans[stats.monthlyLoans.length - 1].count < stats.monthlyLoans[0].count ? '↓ Disminuyendo' : '→ Estable'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaChartLine className="text-gray-300 text-5xl mx-auto mb-3" />
                  <p className="text-gray-500">No hay datos de préstamos para mostrar</p>
                  <p className="text-gray-400 text-sm mt-1">Los préstamos aparecerán aquí cuando haya actividad</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Loading state */}
        {(isAdmin || isSuperAdmin) && loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando estadísticas...</p>
          </div>
        )}

        {/* Información adicional según el rol */}
        {isUser && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaBookOpen className="text-blue-500 text-lg mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">¿Sabías que?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Puedes pedir libros prestados desde el carrito de compras. Los préstamos tienen una duración de 14 días 
                  y puedes renovarlos por 7 días más. ¡Aprovecha al máximo tu biblioteca digital!
                </p>
              </div>
            </div>
          </div>
        )}

        {(isAdmin || isSuperAdmin) && !loading && stats.totalLoans > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaClipboardList className="text-green-500 text-lg mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">
                  {isSuperAdmin ? 'Panel de Super Administrador' : 'Panel de Administración'}
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  {isSuperAdmin 
                    ? `Actualmente hay ${stats.activeLoans} préstamos activos y ${stats.overdueLoans} vencidos. Revisa la sección de préstamos para gestionarlos.`
                    : `Tienes ${stats.activeLoans} préstamos activos en el sistema. Revisa los préstamos vencidos para tomar acción.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage