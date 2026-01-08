import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, clientsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/sales`),
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/dashboard/ranking`)
      ]);
      
      setSales(salesRes.data);
      
      const clientsMap = {};
      clientsRes.data.forEach(c => clientsMap[c.id] = c);
      setClients(clientsMap);
      
      const usersMap = {};
      usersRes.data.forEach(u => usersMap[u.user_id] = u.name);
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Registrado': 'bg-blue-100 text-blue-700',
      'Subido a compañía': 'bg-purple-100 text-purple-700',
      'Validación pendiente': 'bg-yellow-100 text-yellow-700',
      'Instalación programada': 'bg-indigo-100 text-indigo-700',
      'Instalado': 'bg-green-100 text-green-700',
      'Finalizado': 'bg-emerald-100 text-emerald-700',
      'Incidencia': 'bg-red-100 text-red-700',
      'Cancelado': 'bg-slate-100 text-slate-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const filteredSales = sales.filter(sale => {
    if (filterStatus !== 'all' && sale.status !== filterStatus) return false;
    if (filterCompany !== 'all' && sale.company !== filterCompany) return false;
    return true;
  });

  const companies = [...new Set(sales.map(s => s.company))];
  const statuses = [...new Set(sales.map(s => s.status))];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Ventas</h1>
          <p className="text-slate-600 mt-1">Historial de ventas registradas</p>
        </div>

        {/* Filtros */}
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Filtrar por Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Filtrar por Compañía</Label>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las compañías</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabla de Ventas */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Compañía</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tarifa</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Empleado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSales.map((sale) => {
                    const client = clients[sale.client_id];
                    return (
                      <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {client?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {client?.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {sale.company}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {sale.pack_type}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getStatusColor(sale.status)} text-xs`}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(sale.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {users[sale.created_by] || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredSales.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No hay ventas que coincidan con los filtros</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sales;
