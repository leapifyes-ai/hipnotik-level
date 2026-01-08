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
  const [clients, setClients] = useState([]);
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
      setClients(clientsRes.data);
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <Card key={incident.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-heading font-semibold text-slate-900">{incident.title}</h3>
                      <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                      <Badge className={getPriorityColor(incident.priority)}>{incident.priority}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{incident.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Tipo: {incident.type}</span>
                      <span>•</span>
                      <span>{new Date(incident.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && incidents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay incidencias registradas</p>
          </div>
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
                    {clients.map(client => (
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
