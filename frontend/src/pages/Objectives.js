import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Target as TargetIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Objectives = () => {
  const { isSuperAdmin } = useAuth();
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    team_target: ''
  });

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const response = await axios.get(`${API_URL}/objectives`);
      setObjectives(response.data);
    } catch (error) {
      console.error('Error fetching objectives:', error);
      toast.error('Error al cargar objetivos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/objectives`, {
        ...formData,
        team_target: parseInt(formData.team_target)
      });
      toast.success('Objetivo creado exitosamente');
      setShowDialog(false);
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        team_target: ''
      });
      fetchObjectives();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear objetivo');
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <div className="text-center py-12">
            <p className="text-slate-500">Acceso solo para SuperAdmin</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Objetivos</h1>
            <p className="text-slate-600 mt-1">Configura y monitorea objetivos del equipo</p>
          </div>
          <Button
            data-testid="create-objective-button"
            onClick={() => setShowDialog(true)}
            className="bg-slate-800 hover:bg-slate-700"
          >
            <Plus className="mr-2" size={18} />
            Nuevo Objetivo
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map((obj) => (
              <Card key={obj.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <TargetIcon className="text-indigo-700" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-slate-900">
                        {monthNames[obj.month - 1]} {obj.year}
                      </h3>
                      <p className="text-sm text-slate-600">Objetivo del Mes</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-heading font-bold text-slate-900">{obj.team_target}</span>
                      <span className="text-sm text-slate-500">ventas</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && objectives.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay objetivos configurados</p>
          </div>
        )}

        {/* Create Objective Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Nuevo Objetivo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mes *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Año *</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label>Objetivo del Equipo *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.team_target}
                  onChange={(e) => setFormData({...formData, team_target: e.target.value})}
                  required
                  className="mt-1.5"
                  placeholder="Número de ventas objetivo"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                  Crear Objetivo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Objectives;
