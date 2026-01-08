import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales`);
      setSales(response.data);
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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Ventas</h1>
          <p className="text-slate-600 mt-1">Historial de ventas registradas</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <Card key={sale.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-heading font-semibold text-slate-900">{sale.company}</h3>
                      <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{sale.pack_type}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(sale.created_at).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && sales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay ventas registradas</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sales;
