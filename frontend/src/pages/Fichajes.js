import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Clock, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Fichajes = () => {
  const [fichajes, setFichajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFichajes();
  }, []);

  const fetchFichajes = async () => {
    try {
      const response = await axios.get(`${API_URL}/fichajes`);
      setFichajes(response.data);
    } catch (error) {
      console.error('Error fetching fichajes:', error);
      toast.error('Error al cargar fichajes');
    } finally {
      setLoading(false);
    }
  };

  const handleFichaje = async (type) => {
    try {
      await axios.post(`${API_URL}/fichajes`, { type });
      toast.success(`${type} registrada exitosamente`);
      fetchFichajes();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar fichaje');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Fichajes</h1>
          <p className="text-slate-600 mt-1">Control de horario</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            data-testid="fichaje-entrada-button"
            onClick={() => handleFichaje('Entrada')}
            className="h-32 bg-green-600 hover:bg-green-700 text-white text-lg font-heading"
          >
            <LogIn className="mr-3" size={24} />
            Fichar Entrada
          </Button>
          <Button
            data-testid="fichaje-salida-button"
            onClick={() => handleFichaje('Salida')}
            className="h-32 bg-red-600 hover:bg-red-700 text-white text-lg font-heading"
          >
            <LogOutIcon className="mr-3" size={24} />
            Fichar Salida
          </Button>
        </div>

        {/* History */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-xl font-heading font-semibold text-slate-900 mb-4">Historial</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {fichajes.slice(0, 10).map((fichaje) => (
                <div key={fichaje.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      fichaje.type === 'Entrada' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {fichaje.type === 'Entrada' ? (
                        <LogIn className={fichaje.type === 'Entrada' ? 'text-green-700' : 'text-red-700'} size={20} />
                      ) : (
                        <LogOutIcon className="text-red-700" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{fichaje.type}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(fichaje.timestamp).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {fichajes.length === 0 && (
                <div className="text-center py-8 text-slate-500">No hay fichajes registrados</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Fichajes;
