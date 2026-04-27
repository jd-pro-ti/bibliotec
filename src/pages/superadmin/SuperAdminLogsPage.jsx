import { useState, useEffect } from 'react'
import { getSystemLogs, getSystemLogsCount } from '../../services/supabaseClient'
// import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FaHistory, FaSearch, FaDownload, FaInfoCircle } from 'react-icons/fa'

const SuperAdminLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    loadLogs()
  }, [limit])

  const loadLogs = async () => {
    setLoading(true)
    const [logsData, count] = await Promise.all([
      getSystemLogs(limit),
      getSystemLogsCount()
    ])
    setLogs(logsData)
    setTotalCount(count)
    setLoading(false)
  }

  const filteredLogs = logs.filter(log => 
    filter === '' || 
    log.message?.toLowerCase().includes(filter.toLowerCase()) ||
    log.level?.toLowerCase().includes(filter.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(filter.toLowerCase())
  )

  const getLevelBadge = (level) => {
    const styles = {
      info: 'bg-blue-100 text-blue-800',
      warn: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      debug: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level] || styles.info}`}>
        {level?.toUpperCase() || 'INFO'}
      </span>
    )
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `system_logs_${new Date().toISOString()}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
              <FaHistory className="text-yellow-600" />
              Registros del Sistema
            </h1>
            <p className="text-gray-600 mt-1">
              Total de logs: {totalCount} | Mostrando: {filteredLogs.length} de {logs.length}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <FaDownload /> Exportar JSON
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar logs por mensaje, nivel o usuario..."
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
              <option value={200}>200 por página</option>
            </select>
          </div>
        </div>

        {/* Tabla de logs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLevelBadge(log.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.user_id ? log.user_id.slice(0, 8) + '...' : 'Sistema'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FaInfoCircle className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500">No hay logs que coincidan con el filtro</p>
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Los logs del sistema se almacenan automáticamente cuando ocurren eventos importantes.
            Para crear logs adicionales, puedes usar el servicio de logger en tu código.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLogsPage