import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaBook, FaUser, FaHeart, FaShoppingCart, FaSignOutAlt, 
  FaUserShield, FaCrown, FaBars, FaTimes, FaInfoCircle, FaFire,
  FaClipboardList, FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, userRole, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Verificar si es admin o superadmin
  const isAdminUser = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdminUser = userRole === 'superadmin';

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Sesión cerrada correctamente');
      navigate('/');
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
    } else {
      toast.error('Error al cerrar sesión');
    }
  };

  const getRoleIcon = () => {
    if (isSuperAdminUser) return <FaCrown className="text-yellow-500 text-sm sm:text-base" />;
    if (userRole === 'admin') return <FaUserShield className="text-blue-500 text-sm sm:text-base" />;
    return <FaUser className="text-gray-500 text-sm sm:text-base" />;
  };

  const getRoleText = () => {
    if (isSuperAdminUser) return 'Super Admin';
    if (userRole === 'admin') return 'Administrador';
    return 'Usuario';
  };

  const NavLinks = ({ mobile = false }) => (
    <div className={`${
      mobile 
        ? 'flex flex-col space-y-3 sm:space-y-4' 
        : 'hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-3'
    }`}>
      <Link 
        to="/" 
        className={`${
          mobile 
            ? 'text-gray-700 hover:text-amber-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all text-base' 
            : 'text-gray-600 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm lg:text-base font-medium'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Inicio
      </Link>
      
      <Link 
        to="/populares" 
        className={`${
          mobile 
            ? 'text-gray-700 hover:text-amber-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all text-base flex items-center gap-2' 
            : 'text-gray-600 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm lg:text-base'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <FaFire className="text-sm sm:text-base text-orange-500" /> 
        <span>Populares</span>
      </Link>
      
      <Link 
        to="/vision" 
        className={`${
          mobile 
            ? 'text-gray-700 hover:text-amber-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all text-base flex items-center gap-2' 
            : 'text-gray-600 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm lg:text-base'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <FaInfoCircle className="text-sm sm:text-base" /> 
        <span>Visión</span>
      </Link>
      
      {/* Mostrar Favoritos y Carrito SOLO para usuarios normales (no admin ni superadmin) */}
      {user && !isAdminUser && (
        <>
          <Link 
            to="/usuario/favoritos" 
            className={`${
              mobile 
                ? 'text-gray-700 hover:text-amber-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all text-base flex items-center gap-2' 
                : 'text-gray-600 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm lg:text-base'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaHeart className="text-sm sm:text-base" /> 
            <span>Favoritos</span>
          </Link>
          <Link 
            to="/usuario/carrito" 
            className={`${
              mobile 
                ? 'text-gray-700 hover:text-amber-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all text-base flex items-center gap-2' 
                : 'text-gray-600 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm lg:text-base'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaShoppingCart className="text-sm sm:text-base" /> 
            <span>Carrito</span>
          </Link>
        </>
      )}
      
      {/* Admin Links - Redirige a /admin/prestamos */}
      {userRole === 'admin' && (
        <div className={`${
          mobile 
            ? 'flex flex-col space-y-2 pl-4 mt-2 border-l-2 border-blue-200' 
            : 'flex items-center space-x-1 lg:space-x-2 border-l border-gray-200 pl-3 lg:pl-4 ml-1 lg:ml-2'
        }`}>
          <Link 
            to="/admin/usuarios" 
            className="text-blue-600 text-sm lg:text-base font-medium hover:text-blue-700 hover:bg-blue-50 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaUsers className="text-sm" />
            Gestionar Usuarios
          </Link>
          <Link 
            to="/admin/prestamos" 
            className="text-blue-600 text-sm lg:text-base font-medium hover:text-blue-700 hover:bg-blue-50 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaClipboardList className="text-sm" />
            Préstamos
          </Link>
        </div>
      )}
      
      {/* SuperAdmin Links - Redirige a /superadmin/prestamos */}
      {isSuperAdminUser && (
        <div className={`${
          mobile 
            ? 'flex flex-col space-y-2 pl-4 mt-2 border-l-2 border-yellow-200' 
            : 'flex items-center space-x-1 lg:space-x-2 border-l border-gray-200 pl-3 lg:pl-4 ml-1 lg:ml-2'
        }`}>
          <Link 
            to="/superadmin/usuarios" 
            className="text-yellow-600 text-sm lg:text-base font-medium hover:text-yellow-700 hover:bg-yellow-50 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaUsers className="text-sm" />
            Admin Usuarios
          </Link>
          <Link 
            to="/superadmin/prestamos" 
            className="text-yellow-600 text-sm lg:text-base font-medium hover:text-yellow-700 hover:bg-yellow-50 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-all flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaClipboardList className="text-sm" />
            Préstamos
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Navbar principal */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-md">
                <FaBook className="text-white text-sm sm:text-base md:text-lg" />
              </div>
              <span className="font-bold text-lg sm:text-xl md:text-2xl">
                <span className="text-gray-800">BiblioTec</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <NavLinks mobile={false} />

            {/* Sección derecha */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {!loading && (
                user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none hover:opacity-80 transition-opacity p-1 rounded-lg hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm">
                        {getRoleIcon()}
                      </div>
                      <span className="text-sm text-gray-700 hidden sm:inline-block font-medium max-w-[100px] lg:max-w-[150px] truncate">
                        {user.email?.split('@')[0]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hidden md:inline-block">
                        {getRoleText()}
                      </span>
                    </button>

                    {/* Dropdown menu */}
                    {isUserMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                            <p className="text-xs text-gray-500 capitalize mt-1">{userRole}</p>
                          </div>
                          <Link 
                            to="/dashboard" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          {/* Mostrar "Mis Préstamos" SOLO para usuarios normales */}
                          {!isAdminUser && (
                            <Link 
                              to="/usuario/prestamos" 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Mis Préstamos
                            </Link>
                          )}
                          {/* Mostrar enlaces administrativos en el dropdown para admins */}
                          {isAdminUser && (
                            <>
                              <div className="border-t border-gray-100 my-1"></div>
                              <p className="px-4 py-1 text-xs text-gray-500 font-semibold">Panel de Control</p>
                              <Link 
                                to={isSuperAdminUser ? "/superadmin/usuarios" : "/admin/usuarios"} 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <FaUsers className="inline mr-2 text-sm" /> Gestionar Usuarios
                              </Link>
                              <Link 
                                to={isSuperAdminUser ? "/superadmin/prestamos" : "/admin/prestamos"} 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <FaClipboardList className="inline mr-2 text-sm" /> Gestionar Préstamos
                              </Link>
                            </>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <FaSignOutAlt className="text-sm" /> Cerrar Sesión
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link 
                      to="/login" 
                      className="text-sm text-gray-600 hover:text-amber-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/registro" 
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      Registrarse
                    </Link>
                  </div>
                )
              )}
              
              {/* Botón menú móvil */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menú"
              >
                {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <Link 
              to="/" 
              className="flex items-center space-x-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                <FaBook className="text-white text-sm" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-gray-800">BiblioTec</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <NavLinks mobile={true} />
          </div>

          {!user && !loading && (
            <div className="p-4 border-t border-gray-200 space-y-2">
              <Link 
                to="/login" 
                className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/registro" 
                className="block w-full text-center bg-amber-600 text-white px-4 py-2.5 rounded-lg hover:bg-amber-700 transition-colors text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;