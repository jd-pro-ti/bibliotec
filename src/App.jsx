import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import PrivateRoute from './components/common/PrivateRoute'

// Páginas públicas
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookDetailPage from './pages/BookDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import PopularesPage from './pages/populares'
import VisionPage from './pages/VisionPage'

// Páginas protegidas
import DashboardPage from './pages/DashboardPage'

// Usuario
import UserFavoritesPage from './pages/user/UserFavoritesPage'
import UserCartPage from './pages/user/UserCartPage'
import UserPrestamos from './pages/user/Userprestamos'

// Admin
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminBooksPage from './pages/admin/AdminBooksPage'
import AdminLoansPage from './pages/admin/AdminLoansPage'

// SuperAdmin
import SuperAdminUsersPage from './pages/superadmin/SuperAdminUsersPage'
import SuperAdminLogsPage from './pages/superadmin/SuperAdminLogsPage'

function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/libro/:bookId" element={<BookDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/populares" element={<PopularesPage />} />
          <Route path="/vision" element={<VisionPage />} />

          {/* Dashboard (redirige según rol) */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />

          {/* Usuario */}
          <Route path="/usuario/favoritos" element={
            <PrivateRoute requiredRole="user">
              <UserFavoritesPage />
            </PrivateRoute>
          } />
          <Route path="/usuario/carrito" element={
            <PrivateRoute requiredRole="user">
              <UserCartPage />
            </PrivateRoute>
          } />
          <Route path="/usuario/prestamos" element={
            <PrivateRoute requiredRole="user">
              <UserPrestamos />
            </PrivateRoute>
          } />

          {/* Admin */}
          <Route path="/admin/usuarios" element={
            <PrivateRoute requiredRole="admin">
              <AdminUsersPage />
            </PrivateRoute>
          } />
          <Route path="/admin/libros" element={
            <PrivateRoute requiredRole="admin">
              <AdminBooksPage />
            </PrivateRoute>
          } />
          <Route path="/admin/prestamos" element={
            <PrivateRoute requiredRole="admin">
              <AdminLoansPage />
            </PrivateRoute>
          } />

          {/* SuperAdmin */}
          <Route path="/superadmin/usuarios" element={
            <PrivateRoute requiredRole="superadmin">
              <SuperAdminUsersPage />
            </PrivateRoute>
          } />
          {/* ✅ Ruta agregada para préstamos de superadmin */}
          <Route path="/superadmin/prestamos" element={
            <PrivateRoute requiredRole="superadmin">
              <AdminLoansPage />
            </PrivateRoute>
          } />
          <Route path="/superadmin/logs" element={
            <PrivateRoute requiredRole="superadmin">
              <SuperAdminLogsPage />
            </PrivateRoute>
          } />
          <Route path="/superadmin/libros" element={
            <PrivateRoute requiredRole="superadmin">
              <AdminBooksPage />
            </PrivateRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  )
}

export default App