import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { validators, validateForm } from '../utils/validators'
import { sanitizers } from '../utils/sanitizers'
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiBookOpen } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const validationRules = {
    email: [validators.required, validators.email],
    password: [validators.required]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'email' ? sanitizers.sanitizeEmail(value) : sanitizers.cleanString(value)

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { isValid, errors: validationErrors } = validateForm(formData, validationRules)

    if (!isValid) {
      setErrors(validationErrors)
      toast.error('Por favor, corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        toast.success('¡Bienvenido a la Biblioteca Digital!')
        navigate(from, { replace: true })
      } else {
        let errorMessage = result.error || 'Error al iniciar sesión'
        
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Correo o contraseña incorrectos'
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirma tu correo electrónico'
        }
        
        toast.error(errorMessage)
        setErrors({ submit: errorMessage })
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      toast.error(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      const result = await loginWithGoogle()

      if (result.success) {
        toast.success('Redirigiendo a Google...')
      } else {
        toast.error(result.error || 'Error al iniciar con Google')
      }
    } catch (error) {
      toast.error('Error al conectar con Google. Intenta con email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-8 sm:px-6">
      {/* Recuadro principal con borde visible */}
      <div className="w-full max-w-[28rem] bg-white rounded-2xl border border-neutral-200 shadow-sm">
        <div className="p-6 sm:p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex justify-center mb-4">
              <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                <FiBookOpen className="text-white text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
              Iniciar sesión
            </h1>
            <p className="text-sm text-neutral-500">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-neutral-900 font-medium hover:underline transition-all">
                Regístrate
              </Link>
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-base" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 text-base border rounded-lg bg-white transition-all duration-200
                    focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400
                    ${errors.email ? 'border-red-400' : 'border-neutral-200 hover:border-neutral-300'}`}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-base" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-9 py-2 text-base border rounded-lg bg-white transition-all duration-200
                    focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400
                    ${errors.password ? 'border-red-400' : 'border-neutral-200 hover:border-neutral-300'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Enlace olvidé contraseña */}
            <div className="text-right">
              <Link to="/recuperar-password" className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="text-center text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FiLogIn size={16} />
                  <span>Iniciar sesión</span>
                </div>
              )}
            </button>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-neutral-400">o</span>
              </div>
            </div>

            {/* Botón de Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                <FcGoogle size={18} />
                <span>Continuar con Google</span>
              </div>
            </button>
          </form>

          {/* Enlace volver al inicio */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage