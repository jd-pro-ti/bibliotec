import { Link } from 'react-router-dom'
import { 
  FiBookOpen, FiDatabase, FiServer, FiCode, FiHeart, 
  FiGithub, FiUsers, FiTrendingUp, FiShield, FiZap, FiGlobe
} from 'react-icons/fi'
import { FaReact } from 'react-icons/fa'

const VisionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      

      {/* Hero Section - Responsive */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-100/50 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6">
              <FiBookOpen className="text-amber-600 text-sm" />
              <span className="text-xs font-medium text-amber-700">Nuestra plataforma</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Sobre <span className="text-amber-600">BiblioTec</span>
            </h1>
            
            <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
              Conoce más sobre nuestra misión, la tecnología que utilizamos y cómo 
              la API de OpenLibrary hace posible esta experiencia.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Misión - Grid responsive */}
        <section className="mb-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
              Nuestra <span className="text-amber-600">Misión</span>
            </h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mb-6"></div>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Democratizar el acceso a la lectura digital, ofreciendo una plataforma 
              intuitiva y accesible que conecte a los lectores con miles de libros 
              de manera gratuita y sencilla.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-10">
            <div className="text-center p-4 sm:p-6 rounded-xl hover:bg-amber-50/50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiUsers className="text-amber-600 text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-base sm:text-lg">Accesible para todos</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Lectura digital disponible desde cualquier dispositivo</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl hover:bg-amber-50/50 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiTrendingUp className="text-amber-600 text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-base sm:text-lg">Siempre actualizada</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Catálogo en constante crecimiento con nuevos títulos</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl hover:bg-amber-50/50 transition-all sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiHeart className="text-amber-600 text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-base sm:text-lg">Hecha con pasión</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Desarrollada por amantes de la lectura</p>
            </div>
          </div>
        </section>

        {/* API Section - Responsive */}
        <section className="mb-16 bg-gray-50 rounded-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <FiDatabase className="text-amber-600 text-2xl" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">API de OpenLibrary</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div>
              <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                BibliotecaDigital utiliza la API de <strong className="text-amber-700">OpenLibrary</strong>, 
                una iniciativa de Internet Archive que proporciona acceso gratuito a millones de libros.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                OpenLibrary es una biblioteca digital abierta y colaborativa que tiene como objetivo 
                crear una página web para cada libro publicado. Su API nos permite acceder a:
              </p>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                  <span>Más de 20 millones de libros</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                  <span>Información detallada de cada obra</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                  <span>Portadas y metadatos completos</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                  <span>Autores, géneros y fechas de publicación</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <FiCode className="text-amber-500" />
                Endpoints utilizados
              </h4>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <code className="text-xs sm:text-sm text-amber-700 break-all">GET /search.json?q={'{query}'}</code>
                  <p className="text-xs text-gray-500 mt-1">Búsqueda de libros por título, autor o género</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <code className="text-xs sm:text-sm text-amber-700 break-all">GET /works/{'{id}'}.json</code>
                  <p className="text-xs text-gray-500 mt-1">Información detallada de un libro específico</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <code className="text-xs sm:text-sm text-amber-700 break-all">GET /covers/b/id/{'{id}'}-L.jpg</code>
                  <p className="text-xs text-gray-500 mt-1">Obtención de portadas de libros</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Características - Responsive */}
        <section className="mb-16 bg-amber-50 rounded-2xl p-6 sm:p-8 md:p-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-6 sm:mb-8">
            Lo que ofrece nuestra <span className="text-amber-600">plataforma</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex gap-3">
              <FiShield className="text-amber-600 text-lg sm:text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Búsqueda avanzada</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Encuentra libros por título, autor o género de forma rápida y precisa</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FiHeart className="text-amber-600 text-lg sm:text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Lista de favoritos</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Guarda tus libros preferidos y accede a ellos fácilmente</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FiZap className="text-amber-600 text-lg sm:text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Carrito de compras</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Gestiona tus compras de forma intuitiva y segura</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FiTrendingUp className="text-amber-600 text-lg sm:text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Recomendaciones</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Descubre nuevos libros basados en tus intereses</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default VisionPage