import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaChevronRight } from 'react-icons/fa'

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  const getBreadcrumbName = (name, index, fullPath) => {
    const names = {
      'libro': 'Libro',
      'dashboard': 'Dashboard',
      'admin': 'Administración',
      'superadmin': 'Super Administración',
      'usuarios': 'Usuarios',
      'favoritos': 'Mis Favoritos',
      'carrito': 'Mi Carrito',
      'logs': 'Registros del Sistema',
      'libros': 'Gestión de Libros'
    }
    if (names[name]) return names[name]
    if (index === pathnames.length - 1 && fullPath.includes('/libro/')) {
      return 'Detalle del Libro'
    }
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  if (pathnames.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 py-2 px-4 bg-gray-100 rounded-lg overflow-x-auto">
      <Link to="/" className="hover:text-primary-600 flex items-center whitespace-nowrap">
        <FaHome className="mr-1" /> Inicio
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const breadcrumbName = getBreadcrumbName(name, index, location.pathname)

        return (
          <div key={name} className="flex items-center space-x-2 whitespace-nowrap">
            <FaChevronRight className="text-gray-400 text-xs" />
            {isLast ? (
              <span className="text-gray-700 font-medium">{breadcrumbName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-primary-600">
                {breadcrumbName}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs