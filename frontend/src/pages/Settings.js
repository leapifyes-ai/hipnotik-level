import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { AlertCircle, Trash2, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Settings = () => {
  const { user, isSuperAdmin } = useAuth();
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    toast.success('Idioma actualizado');
  };

  const handleSeedData = async () => {
    if (!window.confirm('¿Crear datos de prueba?')) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/demo/seed`);
      toast.success('Datos demo creados exitosamente');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear datos demo');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanData = async () => {
    if (!window.confirm('¿ESTÁS SEGURO? Esto eliminará todos los datos demo.')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/demo/clean`);
      toast.success('Datos demo eliminados exitosamente');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al eliminar datos demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Configuración</h1>
          <p className="text-slate-600 mt-1">Preferencias y ajustes del sistema</p>
        </div>

        {/* User Info */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4">Información de Usuario</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Nombre</p>
              <p className="text-base font-medium text-slate-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="text-base font-medium text-slate-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Rol</p>
              <p className="text-base font-medium text-slate-900">{user?.role}</p>
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4">Idioma</h3>
          <div className="max-w-xs">
            <Label>Seleccionar Idioma</Label>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger data-testid="language-selector" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Castellano</SelectItem>
                <SelectItem value="ca">Catalán</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Demo Data - SuperAdmin Only */}
        {isSuperAdmin && (
          <Card className="p-6 bg-white border-slate-200 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-amber-700" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-slate-900">Datos Demo</h3>
                <p className="text-sm text-slate-600 mt-1">Gestiona los datos de prueba del sistema</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                data-testid="seed-demo-button"
                onClick={handleSeedData}
                disabled={loading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Database className="mr-2" size={18} />
                Crear Datos Demo
              </Button>
              <Button
                data-testid="clean-demo-button"
                onClick={handleCleanData}
                disabled={loading}
                variant="destructive"
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2" size={18} />
                Eliminar Datos Demo
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
