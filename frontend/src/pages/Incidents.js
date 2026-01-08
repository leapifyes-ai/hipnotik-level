import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    priority: 'Media',
    type: 'Técnica'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, clientsRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`),
        axios.get(`${API_URL}/clients`)
      ]);
      
      setIncidents(incidentsRes.data);
      
      const clientsMap = {};
      clientsRes.data.forEach(c => clientsMap[c.id] = c);
      setClients(clientsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/incidents`, formData);
      toast.success('Incidencia creada exitosamente');
      setShowDialog(false);
      setFormData({
        client_id: '',
        title: '',
        description: '',
        priority: 'Media',
        type: 'Técnica'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear incidencia');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Baja': 'bg-blue-100 text-blue-700',
      'Media': 'bg-yellow-100 text-yellow-700',
      'Alta': 'bg-orange-100 text-orange-700',
      'Crítica': 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Abierta': 'bg-red-100 text-red-700',
      'En Proceso': 'bg-yellow-100 text-yellow-700',
      'Cerrada': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Incidencias</h1>
            <p className="text-slate-600 mt-1">Gestiona y resuelve incidencias</p>
          </div>
          <Button
            data-testid="create-incident-button"
            onClick={() => setShowDialog(true)}
            className="bg-slate-800 hover:bg-slate-700"
          >
            <Plus className="mr-2" size={18} />
            Nueva Incidencia
          </Button>
        </div>

        {/* Tabla de Incidencias */}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Días Abierta</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {incidents.map((incident) => {
                    const client = clients[incident.client_id];
                    const daysOpen = getDaysOpen(incident.created_at);
                    return (
                      <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {client?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{incident.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{incident.description}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {incident.type}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getPriorityColor(incident.priority)} text-xs`}>
                            {incident.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getStatusColor(incident.status)} text-xs`}>
                            {incident.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                          {daysOpen} {daysOpen === 1 ? 'día' : 'días'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(incident.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {incidents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No hay incidencias registradas</p>
              </div>
            )}
          </Card>
        )}

        {/* Create Incident Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Nueva Incidencia</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Cliente *</Label>
                <Select value={formData.client_id} onValueChange={(val) => setFormData({...formData, client_id: val})} required>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(clients).map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name} - {client.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Descripción *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="mt-1.5"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridad *</Label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo *</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Técnica">Técnica</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Administrativa">Administrativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                  Crear Incidencia
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Incidents;
