import { FaBook, FaHeart, FaGithub, FaTwitter, FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Grid responsive: 1 columna en móvil, 2 en tablet, 4 en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          
          {/* Brand - Columna de marca */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
              <FaBook className="text-primary-500 text-xl sm:text-2xl" />
              <span className="font-bold text-lg sm:text-xl text-white">
                BibliotecaDigital
              </span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              Descubre miles de libros y disfruta de la lectura digital. 
              Tu biblioteca personal en la nube.
            </p>
          </div>

          {/* Quick Links - Enlaces rápidos */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-base">
              <li>
                <Link 
                  to="/" 
                  className="hover:text-primary-400 transition-colors duration-200 inline-block"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/libros/populares" 
                  className="hover:text-primary-400 transition-colors duration-200 inline-block"
                >
                  Libros Populares
                </Link>
              </li>
              <li>
                <Link 
                  to="/libros/recomendados" 
                  className="hover:text-primary-400 transition-colors duration-200 inline-block"
                >
                  Recomendados
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - Enlaces legales */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-4">
              Legal
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-base">
              <li>
                <Link 
                  to="/terminos" 
                  className="hover:text-primary-400 transition-colors duration-200 inline-block"
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacidad" 
                  className="hover:text-primary-400 transition-colors duration-200 inline-block"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacto" 
                  className="hover:text-primary-400 transition-colors duration-200 inline-block"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Social - Redes sociales */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-4">
              Síguenos
            </h3>
            <div className="flex justify-center sm:justify-start space-x-5 sm:space-x-6">
              <a 
                href="#" 
                className="hover:text-primary-400 transition-colors duration-200 transform hover:scale-110 inline-block"
                aria-label="GitHub"
              >
                <FaGithub size={22} className="sm:w-6 sm:h-6" />
              </a>
              <a 
                href="#" 
                className="hover:text-primary-400 transition-colors duration-200 transform hover:scale-110 inline-block"
                aria-label="Twitter"
              >
                <FaTwitter size={22} className="sm:w-6 sm:h-6" />
              </a>
              <a 
                href="#" 
                className="hover:text-primary-400 transition-colors duration-200 transform hover:scale-110 inline-block"
                aria-label="Facebook"
              >
                <FaFacebook size={22} className="sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-800 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 text-center text-sm sm:text-base">
          <p>
            &copy; {currentYear} BibliotecaDigital. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;